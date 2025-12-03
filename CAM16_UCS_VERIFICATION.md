# CAM16-UCS Implementation Verification Guide

## Summary

**CAM16-UCS is ONLY used in AI/TensorFlow Lite inference, NOT in fallback detection.**

### Where CAM16-UCS is Used:
- ✅ **AI Model (TensorFlow Lite)**: `ColorTFLiteModule.kt` → `predictFromRgb()` method
  - Converts RGB → CAM16-UCS before feeding to neural network
  - File: `android/app/src/main/java/com/colorlensv1/tflite/ColorTFLiteModule.kt`

### Where CAM16-UCS is NOT Used:
- ❌ **Fallback Detection**: Uses CIELAB + Delta E 2000 (via `ColorMatcher.ts`)
  - File: `services/ColorMatcher.ts`
  - Uses `colorjs.io` library for LAB color space calculations

---

## How to Verify CAM16-UCS is Working

### 1. Check Console Logs (Android Logcat)

When the app runs color detection, you should see these logs:

```
ColorTFLite: Predicting from RGB -> CAM16-UCS for (255,128,64)
ColorTFLite: CAM16-UCS conversion successful - J'=XX.XX, a'=XX.XX, b'=XX.XX
ColorTFLite: Scaled input vector for model: [X.XX, X.XX, X.XX]
ColorTFLite: Running inference with input=[X.XX, X.XX, X.XX]
ColorTFLite: Prediction result - Index: X, Score: X.XX
```

**If you see these logs, CAM16-UCS is being used!**

### 2. Check React Native Console Logs

In your React Native debugger/console, you should see:

```
ColorDetectorInference: Using TensorFlow Lite model for inference (native CAM16-UCS)
ColorDetectorInference: Preprocessed RGB input: {r: 255, g: 128, b: 64}
ColorDetectorInference: TensorFlow Lite prediction result: {index: X, score: X.XX, cam16: [XX.XX, XX.XX, XX.XX]}
ColorDetectorInference: CAM16-UCS values received from native: [XX.XX, XX.XX, XX.XX]
```

### 3. Verify Model is Loaded

Check if the model loads successfully:

```
ColorTFLite: Starting to load color_model.tflite...
ColorTFLiteHelper: Loading model from assets: color_model.tflite
ColorTFLiteHelper: TensorFlow Lite interpreter created successfully!
ColorTFLite: Model loaded successfully! Label count: XX
```

**If model doesn't load, CAM16-UCS won't be used** (fallback to LAB/Delta E will be used instead).

---

## Why You Might Not See Accuracy Improvements

### 1. Model Not Loaded
- **Symptom**: Logs show "Model not loaded, using fallback ColorMatcher"
- **Solution**: Check that `color_model.tflite` exists in `android/app/src/main/assets/`
- **Impact**: Falls back to LAB-based matching, CAM16-UCS never used

### 2. Model Trained on Different Color Space
- **Issue**: If your model was trained on LAB inputs but you're now feeding CAM16-UCS
- **Symptom**: Poor predictions, low confidence scores
- **Solution**: Retrain model with CAM16-UCS inputs to match the new conversion

### 3. Preprocessing Affecting Input
- **Issue**: `preprocessRGBForShadow()` modifies RGB before CAM16-UCS conversion
- **Location**: `services/ColorDetectorInference.ts` line 91
- **Impact**: May affect CAM16-UCS values if preprocessing is too aggressive

### 4. Fallback Still Uses LAB
- **Issue**: When model confidence < 65%, system falls back to LAB-based matching
- **Location**: `services/ColorDetectorInference.ts` line 120
- **Impact**: You won't see CAM16-UCS benefits if model is frequently rejected

### 5. Model Input Scaling Mismatch
- **Current scaling**: 
  - `J' / 100.0`
  - `a' / 50.0`
  - `b' / 50.0`
- **Issue**: If model expects different scaling, predictions will be wrong
- **Solution**: Verify model was trained with these exact scaling factors

---

## Testing Steps

### Step 1: Verify Model Loads
1. Run app and check logs for "Model loaded successfully"
2. If not loading, check `android/app/src/main/assets/color_model.tflite` exists

### Step 2: Verify CAM16-UCS Conversion
1. Point camera at a known color (e.g., pure red: RGB 255,0,0)
2. Check logs for "CAM16-UCS conversion successful"
3. Verify J', a', b' values are reasonable (not NaN, not 0)

### Step 3: Compare with Python Reference
Test the same RGB values in Python to verify Kotlin implementation:

```python
import colour
rgb = [255, 0, 0]  # Pure red
xyz = colour.sRGB_to_XYZ(rgb)
cam16 = colour.XYZ_to_CAM16UCS(xyz)
print(f"J'={cam16[0]}, a'={cam16[1]}, b'={cam16[2]}")
```

Compare with Kotlin output in logs.

### Step 4: Check Model Confidence
1. If model confidence is consistently < 65%, it's falling back to LAB matching
2. This means CAM16-UCS is being used but results are being rejected
3. Consider lowering threshold or retraining model

---

## Debugging Checklist

- [ ] Model file exists: `android/app/src/main/assets/color_model.tflite`
- [ ] Labels file exists: `android/app/src/main/assets/labels.json`
- [ ] Logs show "Model loaded successfully"
- [ ] Logs show "CAM16-UCS conversion successful" with valid values
- [ ] Logs show "Running inference with input=..." with non-zero values
- [ ] Model confidence scores are reasonable (> 0.1)
- [ ] Model is being accepted (confidence >= 0.65) or threshold is appropriate
- [ ] CAM16-UCS values match Python reference implementation

---

## Files Involved

1. **CAM16-UCS Implementation**: `android/app/src/main/java/com/colorlensv1/color/Cam16Ucs.kt`
2. **AI Module (uses CAM16-UCS)**: `android/app/src/main/java/com/colorlensv1/tflite/ColorTFLiteModule.kt`
3. **Inference Service**: `services/ColorDetectorInference.ts`
4. **Fallback Matcher (uses LAB)**: `services/ColorMatcher.ts`
5. **Native Bridge**: `services/ColorTFLiteNative.ts`

---

## Next Steps if Not Working

1. **Check logs first** - Most issues will show up in console
2. **Verify model file** - Ensure it exists and is valid
3. **Test CAM16-UCS conversion** - Compare with Python reference
4. **Check model training** - Ensure model was trained with CAM16-UCS inputs
5. **Adjust confidence threshold** - If model is too strict, lower from 0.65
6. **Consider retraining** - If model was trained on LAB, retrain on CAM16-UCS





