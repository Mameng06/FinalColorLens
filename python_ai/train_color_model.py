#!/usr/bin/env python3
from pathlib import Path
import json
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.utils import to_categorical
import argparse
import pickle
import colour

BASE = Path(__file__).resolve().parent
COLORMODEL = BASE.parent.joinpath('colormodel.json')

parser = argparse.ArgumentParser()
parser.add_argument('--label_field', choices=['family','name'], default='family')
parser.add_argument('--samples_per_class', type=int, default=3000)
parser.add_argument('--sigma', nargs=3, type=float, default=[0.3,0.3,0.3])  # CAM16-UCS is sensitive, use smaller sigma
parser.add_argument('--epochs', type=int, default=150)
parser.add_argument('--batch_size', type=int, default=32)
parser.add_argument('--quantize', action='store_true')
parser.add_argument('--output_dir', default=str(BASE.joinpath('output')))
args = parser.parse_args()

out_dir = Path(args.output_dir)
out_dir.mkdir(parents=True, exist_ok=True)

# -----------------------------------------------
# Helper for converting any color to CIE Lab
# -----------------------------------------------
def rgb_to_lab(rgb):
    """
    rgb: [R,G,B] in 0–255
    returns L*, a*, b*
    """
    rgb01 = np.array(rgb) / 255.0
    xyz = colour.sRGB_to_XYZ(rgb01)
    lab = colour.XYZ_to_Lab(xyz)
    return np.array(lab, dtype=np.float32)

# -----------------------------------------------
# Load your JSON
# -----------------------------------------------
with open(COLORMODEL, 'r', encoding='utf-8') as f:
    data = json.load(f)

label_field = args.label_field

# -----------------------------------------------
# Convert all colors → Lab
# -----------------------------------------------
lab_list = []
labels = []

for item in data:
    rgb = item.get("rgb")
    if not rgb:
        continue

    lab = rgb_to_lab(rgb)
    lab_list.append(lab)
    labels.append(item.get(label_field) or item.get("name"))

if len(lab_list) == 0:
    raise SystemExit("No valid RGB entries for Lab.")

base_vectors = np.array(lab_list, dtype=np.float32)
labels = np.array(labels, dtype=object)

N = args.samples_per_class
sigma = np.array(args.sigma, dtype=np.float32)

X_list = []
y_list = []

# -----------------------------------------------
# Augmentation (in CAM16-UCS space)
# -----------------------------------------------
def is_valid(cam):
    # J' < 0 is invalid
    return cam[0] > 0.0

for cam, name in zip(base_vectors, labels):
    sigma_levels = [sigma * 0.8, sigma, sigma * 1.2]
    J_scales = [0.7, 0.9, 1.0, 1.1]

    per_group = max(1, N // (len(sigma_levels) * len(J_scales)))

    for s in sigma_levels:
        for jscale in J_scales:
            base = cam.copy()
            base[0] = base[0] * jscale

            noise = np.random.normal(0.0, s, size=(per_group, 3)).astype(np.float32)
            samples = base + noise

            valid = np.array([c for c in samples if is_valid(c)])
            if len(valid) > 0:
                X_list.append(valid)
                y_list.extend([name] * len(valid))

X = np.vstack(X_list).astype(np.float32)
y = np.array(y_list)

# -----------------------------------------------
# Encode labels
# -----------------------------------------------
le = LabelEncoder()
y_idx = le.fit_transform(y)
y_cat = to_categorical(y_idx)
num_classes = y_cat.shape[1]

# -----------------------------------------------
# Scale CAM16-UCS values
# Lab ranges are small, so normalize smartly
# L* ≈ 0–100, a*/b* roughly –128..128
# -----------------------------------------------
X_scaled = np.empty_like(X)
X_scaled[:,0] = X[:,0] / 100.0
X_scaled[:,1] = X[:,1] / 128.0
X_scaled[:,2] = X[:,2] / 128.0

# -----------------------------------------------
# High-accuracy model architecture
# -----------------------------------------------
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(3,)),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.4),

    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.3),

    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dropout(0.2),

    tf.keras.layers.Dense(num_classes, activation='softmax')
])

lr_schedule = tf.keras.optimizers.schedules.ExponentialDecay(
    initial_learning_rate=0.0005,
    decay_steps=8000,
    decay_rate=0.95,
    staircase=True
)

optimizer = tf.keras.optimizers.Adam(learning_rate=lr_schedule)

model.compile(
    optimizer=optimizer,
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.fit(
    X_scaled, y_cat,
    epochs=args.epochs,
    batch_size=args.batch_size,
    validation_split=0.2,
    verbose=1
)

# -----------------------------------------------
# Save model and labels
# -----------------------------------------------
model_path = out_dir.joinpath('color_model.h5')
model.save(str(model_path))

with open(out_dir.joinpath('labels.json'), 'w', encoding='utf-8') as f:
    json.dump(list(le.classes_), f, ensure_ascii=False)

with open(out_dir.joinpath('label_encoder.pkl'), 'wb') as f:
    pickle.dump(le, f)

# -----------------------------------------------
# Export TFLite
# -----------------------------------------------
converter = tf.lite.TFLiteConverter.from_keras_model(model)

if args.quantize:
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    def rep_dataset():
        for i in range(min(200, X_scaled.shape[0])):
            idx = np.random.randint(0, X_scaled.shape[0])
            yield [X_scaled[idx:idx+1].astype(np.float32)]
    converter.representative_dataset = rep_dataset

tflite_model = converter.convert()
with open(out_dir.joinpath('color_model.tflite'), 'wb') as f:
    f.write(tflite_model)

print("saved", str(model_path))
print("saved", str(out_dir.joinpath('labels.json')))
print("saved", str(out_dir.joinpath('color_model.tflite')))
