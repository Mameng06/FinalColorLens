import ColorTFLite from './ColorTFLiteNative'
import { findClosestColor } from './ColorMatcher'

export type InferenceResult = { family: string; hex: string; realName: string; score?: number; confidence?: number }

async function ensureModelLoaded() {
  try {
    console.log("ColorDetectorInference: Attempting to load TensorFlow Lite model...");
    await ColorTFLite.loadModel();
    console.log("ColorDetectorInference: TensorFlow Lite model loaded successfully!");
    return true;
  } catch (e) {
    console.log("ColorDetectorInference: Failed to load TensorFlow Lite model:", e);
    return false;
  }
}

function preprocessRGBForShadow(rgb: { r: number; g: number; b: number }) {
  // Make a simple, fast preprocessing step to reduce shadow/overexposure issues
  // Strategy:
  // - Check if pixel is too dark/invalid (V < 0.08 or L < 5); if so, skip or recover
  // - If pixel is very dark but has chromatic info, boost chromaticity and set a reasonable intensity
  // - If pixel is very bright, slightly clamp to avoid wash-out
  // - Apply light gamma correction for dark pixels
  try {
    let { r, g, b } = rgb;
    r = Math.round(r); g = Math.round(g); b = Math.round(b);
    const avg = (r + g + b) / 3;

    // Check HSV Value (V = max(r,g,b) / 255)
    const maxRGB = Math.max(r, g, b);
    const hsvValue = maxRGB / 255;
    
    // Check LAB Lightness approximation: L = 0.299*R + 0.587*G + 0.114*B (simplified)
    const labLApprox = (0.299 * r + 0.587 * g + 0.114 * b) / 255 * 100;

    // Skip or recover too-dark samples (V < 0.08 or L < 5)
    if (hsvValue < 0.08 || labLApprox < 5) {
      // Very dark; likely noise or invalid. Try to recover by boosting with a baseline
      const sum = (r + g + b) || 1;
      const nr = r / sum; const ng = g / sum; const nb = b / sum;
      const recoveredIntensity = 80; // Set a minimum baseline for recovery
      r = Math.round(nr * recoveredIntensity);
      g = Math.round(ng * recoveredIntensity);
      b = Math.round(nb * recoveredIntensity);
    }

    let outR = r, outG = g, outB = b;

    // Dark (shadow) handling: boost chromaticity and set moderate intensity
    if (avg < 90) {
      const sum = (r + g + b) || 1;
      const nr = r / sum; const ng = g / sum; const nb = b / sum;
      // pick a target intensity so the color is visible but not clipped
      const targetIntensity = Math.min(220, Math.max(120, Math.round(avg * 1.8)));
      outR = Math.round(nr * targetIntensity);
      outG = Math.round(ng * targetIntensity);
      outB = Math.round(nb * targetIntensity);
      // gentle gamma to lift midtones
      const gamma = 0.85;
      outR = Math.round(255 * Math.pow(outR / 255, gamma));
      outG = Math.round(255 * Math.pow(outG / 255, gamma));
      outB = Math.round(255 * Math.pow(outB / 255, gamma));
    }

    // Bright (overexposed) handling: scale down a bit to recover color
    if (avg > 230) {
      const maxc = Math.max(r, g, b) || 1;
      const scale = 230 / maxc;
      outR = Math.round(outR * scale);
      outG = Math.round(outG * scale);
      outB = Math.round(outB * scale);
    }

    // Clamp values
    outR = Math.min(255, Math.max(0, outR));
    outG = Math.min(255, Math.max(0, outG));
    outB = Math.min(255, Math.max(0, outB));

    return { r: outR, g: outG, b: outB };
  } catch (e) {
    return rgb;
  }
}

export async function inferColorFromRGB(rgb: { r: number; g: number; b: number }, confidenceThreshold = 0.65): Promise<InferenceResult | null> {
  try {
    console.log("ColorDetectorInference: Starting color inference for RGB:", rgb);
    const loaded = await ensureModelLoaded();
    // Preprocess the RGB to reduce shadow/overexposure errors
    const pre = preprocessRGBForShadow(rgb);
    
    if (!loaded) {
      console.log("ColorDetectorInference: Model not loaded, using fallback ColorMatcher");
      const match = findClosestColor([rgb.r, rgb.g, rgb.b], 3);
      return { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name, confidence: match.closest_match.confidence };
    }

    console.log("ColorDetectorInference: Using TensorFlow Lite model for inference (native CAM16-UCS)");
    const res = await ColorTFLite.predictFromRgb(pre.r, pre.g, pre.b);
    console.log("ColorDetectorInference: TensorFlow Lite prediction result:", res);
    
    if (!res) {
      console.log("ColorDetectorInference: TensorFlow Lite prediction failed, using fallback");
      const match = findClosestColor([rgb.r, rgb.g, rgb.b], 3);
      return { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name, confidence: match.closest_match.confidence };
    }
    
    const score = res.score ?? 0;
    const confidenceFromModel = Number((score * 100).toFixed(2));
    const idx = res.index;
    const detectedJ = Array.isArray(res.cam16) ? res.cam16[0] : ((0.299 * pre.r + 0.587 * pre.g + 0.114 * pre.b) / 255) * 100;
    console.log("ColorDetectorInference: Final prediction - Index:", idx, "Score:", score, "Threshold:", confidenceThreshold, "J'≈", detectedJ);
    
    // Two-stage detection: Model + Delta E validation (ColorBlindPal approach)
    // Use matcher on preprocessed RGB as well to be consistent under shadow/lighting
    const matcherResult = findClosestColor([pre.r, pre.g, pre.b], 3);
    const matcherConfidence = matcherResult.closest_match.confidence || 50;
    
    if (score >= confidenceThreshold) {
      const labels = require('../android/app/src/main/assets/labels.json') as string[];
      const label = labels[idx] || '';
      const datasetFamily = (matcherResult.closest_match.family || '').trim();
      const chosenFamily = datasetFamily || label || matcherResult.closest_match.name;

      // If the detection is from a very dark region, prefer the matcher a bit more
      // Determine luminance (L) to detect shadow situations
      const detectedL = detectedJ;
      let blendedConfidence = Math.round((confidenceFromModel + matcherConfidence) / 2);
      if (detectedL < 30) {
        // shadow: weighted blend favoring matcher
        blendedConfidence = Math.round((confidenceFromModel * 0.4) + (matcherConfidence * 0.6));
      } else if (detectedL < 55) {
        // somewhat dim: slight preference to matcher
        blendedConfidence = Math.round((confidenceFromModel * 0.45) + (matcherConfidence * 0.55));
      }

      console.log("ColorDetectorInference: Model accepted - blending model conf:", confidenceFromModel, "with matcher conf:", matcherConfidence, "= ", blendedConfidence, "(L=", detectedL, ")");

      return { family: chosenFamily, hex: matcherResult.closest_match.hex, realName: matcherResult.closest_match.name, score, confidence: blendedConfidence };
    }
    
    const datasetFamily = (matcherResult.closest_match.family || '').trim();
    const fallbackFamily = datasetFamily || matcherResult.closest_match.name;
    console.log("ColorDetectorInference: Model rejected, using matcher fallback with confidence:", matcherConfidence);
    // Use matcher confidence for fallback (preprocessed input used)
    return { family: fallbackFamily, hex: matcherResult.closest_match.hex, realName: matcherResult.closest_match.name, score, confidence: matcherConfidence };
  } catch (e) {
    console.log("ColorDetectorInference: Error during inference:", e);
    try { const match = findClosestColor([rgb.r, rgb.g, rgb.b], 3); return { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name, confidence: match.closest_match.confidence } } catch (_e2) { return null }
  }
}

export default { inferColorFromRGB }
