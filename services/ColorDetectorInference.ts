import ColorTFLite from './ColorTFLiteNative'
import ColorMatcherNative from './ColorMatcherNative'

export type InferenceResult = { family: string; hex: string; realName: string; score?: number; confidence?: number; detectedRgb?: { r: number; g: number; b: number }; matchedHex?: string }

// Cache initialization state to avoid repeated checks
let modelLoaded: boolean | null = null
let modelLoadPromise: Promise<boolean> | null = null
let matcherInitialized: boolean | null = null
let matcherInitPromise: Promise<boolean> | null = null
let labelsCache: string[] | null = null

const DEBUG = false // Set to true for debugging

function log(...args: any[]) {
  if (DEBUG) console.log(...args)
}

type HueInfo = { h: number; s: number; l: number }

function rgbToHueInfo(r: number, g: number, b: number): HueInfo {
  const rn = Math.max(0, Math.min(255, r)) / 255
  const gn = Math.max(0, Math.min(255, g)) / 255
  const bn = Math.max(0, Math.min(255, b)) / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  let h = 0
  if (delta === 0) {
    h = 0
  } else if (max === rn) {
    h = ((gn - bn) / delta) % 6
  } else if (max === gn) {
    h = (bn - rn) / delta + 2
  } else {
    h = (rn - gn) / delta + 4
  }
  h *= 60
  if (h < 0) h += 360
  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  return { h, s, l }
}

async function ensureModelLoaded() {
  // Return cached result if available
  if (modelLoaded !== null) return modelLoaded
  // Return existing promise if already loading
  if (modelLoadPromise) return modelLoadPromise
  
  modelLoadPromise = (async () => {
    try {
      log("ColorDetectorInference: Loading TensorFlow Lite model...");
      await ColorTFLite.loadModel();
      modelLoaded = true
      log("ColorDetectorInference: Model loaded successfully!");
      return true;
    } catch (e) {
      log("ColorDetectorInference: Failed to load model:", e);
      modelLoaded = false
      return false;
    } finally {
      modelLoadPromise = null
    }
  })()
  
  return modelLoadPromise
}

async function ensureMatcherInitialized() {
  // Return cached result if available
  if (matcherInitialized !== null) return matcherInitialized
  // Return existing promise if already initializing
  if (matcherInitPromise) return matcherInitPromise
  
  matcherInitPromise = (async () => {
    try {
      const initialized = await ColorMatcherNative.isInitialized();
      if (!initialized) {
        log("ColorDetectorInference: Initializing native CAM16-UCS matcher...");
        await ColorMatcherNative.initialize();
        log("ColorDetectorInference: Native CAM16-UCS matcher initialized!");
      }
      matcherInitialized = true
      return true;
    } catch (e) {
      log("ColorDetectorInference: Failed to initialize native matcher:", e);
      matcherInitialized = false
      return false;
    } finally {
      matcherInitPromise = null
    }
  })()
  
  return matcherInitPromise
}

async function findClosestColorNative(rgb: number[], topN = 3) {
  // Ensure matcher is initialized (should already be done on app start)
  await ensureMatcherInitialized();
  // Native matcher is fast and should always work
  return await ColorMatcherNative.findClosestColor(rgb, topN);
}

// Initialize early (call this on app start)
export async function initializeColorDetection() {
  // Initialize both in parallel
  await Promise.all([
    ensureModelLoaded(),
    ensureMatcherInitialized()
  ])
}

// Light preprocessing - shadow lifting is now handled natively in CAM16-UCS conversion
// This only does minimal corrections for extreme cases
function preprocessRGBForShadow(rgb: { r: number; g: number; b: number }) {
  try {
    let r = Math.round(rgb.r)
    let g = Math.round(rgb.g)
    let b = Math.round(rgb.b)
    const maxRGB = Math.max(r, g, b)

    // Only handle extreme cases - native shadow lifting handles the rest
    // Very dark (likely noise) - minimal recovery
    if (maxRGB < 15) {
      const sum = r + g + b || 1
      const scale = 60 / sum
      return {
        r: Math.min(255, Math.max(0, Math.round(r * scale))),
        g: Math.min(255, Math.max(0, Math.round(g * scale))),
        b: Math.min(255, Math.max(0, Math.round(b * scale)))
      }
    }

    // Very bright (overexposed) - slight reduction
    if (maxRGB > 250) {
      const scale = 250 / maxRGB
      return {
        r: Math.min(255, Math.max(0, Math.round(r * scale))),
        g: Math.min(255, Math.max(0, Math.round(g * scale))),
        b: Math.min(255, Math.max(0, Math.round(b * scale)))
      }
    }

    // For normal cases, return as-is - native shadow lifting will handle it
    return { r, g, b }
  } catch (e) {
    return rgb
  }
}

function getLabels(): string[] {
  if (labelsCache === null) {
    try {
      labelsCache = require('../android/app/src/main/assets/labels.json') as string[]
    } catch (e) {
      labelsCache = []
    }
  }
  return labelsCache
}

export async function inferColorFromRGB(rgb: { r: number; g: number; b: number }, confidenceThreshold = 0.50): Promise<InferenceResult | null> {
  try {
    const loaded = await ensureModelLoaded();
    // Use the RGB as-is if it's already white-balance corrected (from ColorDetector.tsx)
    // Only apply minimal preprocessing for extreme cases that might break white balance
    const pre = preprocessRGBForShadow(rgb);
    
    if (!loaded) {
      // Use preprocessed RGB (which should already be white-balance corrected)
      const match = await findClosestColorNative([pre.r, pre.g, pre.b], 3);
      return { 
        family: match.closest_match.family || match.closest_match.name, 
        hex: match.closest_match.hex, 
        realName: match.closest_match.name, 
        confidence: match.closest_match.confidence,
        detectedRgb: { r: rgb.r, g: rgb.g, b: rgb.b },
        matchedHex: match.closest_match.hex
      };
    }

    const res = await ColorTFLite.predictFromRgb(pre.r, pre.g, pre.b);
    
    if (!res) {
      // Use preprocessed RGB (which should already be white-balance corrected)
      const match = await findClosestColorNative([pre.r, pre.g, pre.b], 3);
      return { 
        family: match.closest_match.family || match.closest_match.name, 
        hex: match.closest_match.hex, 
        realName: match.closest_match.name, 
        confidence: match.closest_match.confidence,
        detectedRgb: { r: rgb.r, g: rgb.g, b: rgb.b },
        matchedHex: match.closest_match.hex
      };
    }
    
    const score = res.score ?? 0;
    const confidenceFromModel = Math.round(score * 100);
    const idx = res.index;
    
    // Get matcher result for validation and hex/name
    const matcherResult = await findClosestColorNative([pre.r, pre.g, pre.b], 3);
    const matcherConfidence = matcherResult.closest_match.confidence || 50;
    
    const labels = getLabels();
    const label = labels[idx] || '';
    const matcherFamilyRaw = matcherResult.closest_match.family || matcherResult.closest_match.name || '';
    const datasetFamily = matcherFamilyRaw.trim();
    const modelFamily = (label || '').trim();
    
    // Helper to detect neutral families - distinguish white from gray
    const WHITE_FAMILY_REGEX = /(white|snow|ivory|cream)/i;
    const GRAY_FAMILY_REGEX = /(gray|grey|silver|ash)/i;
    const BLACK_FAMILY_REGEX = /(black|ebony|charcoal)/i;
    
    const modelIsWhite = modelFamily ? WHITE_FAMILY_REGEX.test(modelFamily) : false;
    const modelIsGray = modelFamily ? GRAY_FAMILY_REGEX.test(modelFamily) : false;
    const modelIsNeutral = modelIsWhite || modelIsGray || (modelFamily ? /(black|neutral)/i.test(modelFamily) : false);
    
    const matcherIsWhite = datasetFamily ? WHITE_FAMILY_REGEX.test(datasetFamily) : false;
    const matcherIsGray = datasetFamily ? GRAY_FAMILY_REGEX.test(datasetFamily) : false;
    const matcherIsNeutral = matcherIsWhite || matcherIsGray || (datasetFamily ? /(black|neutral)/i.test(datasetFamily) : false);
    
    // Check if detected RGB is actually white (high brightness, low saturation)
    // Use preprocessed RGB (after white balance correction) for accurate detection
    // Match the native matcher threshold: min >= 180, delta <= 35
    const isDetectedWhite = (() => {
      // Use preprocessed RGB which has white balance correction applied
      const minVal = Math.min(pre.r, pre.g, pre.b);
      const maxVal = Math.max(pre.r, pre.g, pre.b);
      const delta = maxVal - minVal;
      // More lenient threshold to catch white paper under various lighting
      return minVal >= 180 && delta <= 35;
    })();
    
    // Also check original RGB as fallback (in case preprocessing reduced values)
    const isOriginalWhite = (() => {
      const minVal = Math.min(rgb.r, rgb.g, rgb.b);
      const maxVal = Math.max(rgb.r, rgb.g, rgb.b);
      const delta = maxVal - minVal;
      return minVal >= 180 && delta <= 35;
    })();
    
    // Consider it white if either check passes
    const isWhite = isDetectedWhite || isOriginalWhite;

    // Hue-based family hints (helps differentiate yellow vs green, etc.)
    const hueInfo = rgbToHueInfo(pre.r, pre.g, pre.b);
    // Narrower yellow band; require higher saturation and moderate lightness
    const isYellowHue = hueInfo.s >= 0.28 && hueInfo.h >= 52 && hueInfo.h <= 68 && hueInfo.l >= 0.35;
    // Lime/greenish band slightly broader to catch olive/lime tones
    const isLimeHue = hueInfo.s >= 0.20 && hueInfo.h > 68 && hueInfo.h <= 110;
    
    // If model returns empty, fall back to matcher family immediately
    let chosenFamily = modelFamily || datasetFamily || matcherResult.closest_match.name;
    
    // If model and matcher agree, boost confidence
    const familiesMatch = modelFamily && datasetFamily && 
                         (modelFamily.toLowerCase() === datasetFamily.toLowerCase() || 
                          modelFamily.toLowerCase().includes(datasetFamily.toLowerCase()) ||
                          datasetFamily.toLowerCase().includes(modelFamily.toLowerCase()));
    
    let finalConfidence = confidenceFromModel;
    
    // Prefer matcher if it has significantly higher confidence (more consistent)
    const matcherMuchBetter = matcherConfidence > confidenceFromModel + 15;
    
    if (score >= confidenceThreshold && familiesMatch) {
      // Both agree - boost confidence (model weighted more)
      finalConfidence = Math.round((confidenceFromModel * 0.7) + (matcherConfidence * 0.3));
      finalConfidence = Math.min(100, finalConfidence);
    } else if (score >= confidenceThreshold && !matcherMuchBetter) {
      // Model confident and matcher not much better - use model confidence (prioritize model)
      finalConfidence = confidenceFromModel;
    } else if (matcherMuchBetter && matcherConfidence >= 70) {
      // Matcher is much better and has high confidence - prefer matcher for consistency
      chosenFamily = datasetFamily || chosenFamily;
      finalConfidence = matcherConfidence;
    } else if (score >= confidenceThreshold) {
      // Model confident but matcher might be better - blend
      finalConfidence = Math.round((confidenceFromModel * 0.6) + (matcherConfidence * 0.4));
    } else {
      // Model not confident - use matcher as fallback
      chosenFamily = datasetFamily || chosenFamily;
      finalConfidence = matcherConfidence;
    }
    
    // Special handling for white detection - FORCE white when RGB clearly indicates white
    if (isWhite) {
      // If matcher found white, ALWAYS prefer it over gray (even if model is confident about gray)
      if (matcherIsWhite) {
        chosenFamily = datasetFamily || chosenFamily;
        finalConfidence = Math.max(finalConfidence, matcherConfidence);
        // Boost confidence significantly when input is white and matcher found white
        if (matcherConfidence >= 70) {
          finalConfidence = Math.min(100, finalConfidence + 10);
        }
      }
      // If model found gray but matcher found white, prefer white
      else if (modelIsGray && matcherIsWhite) {
        chosenFamily = datasetFamily || chosenFamily;
        finalConfidence = Math.max(finalConfidence, matcherConfidence);
      }
      // If both found white, boost confidence
      else if (modelIsWhite && matcherIsWhite) {
        finalConfidence = Math.min(100, Math.round((finalConfidence * 0.6) + (matcherConfidence * 0.4)));
      }
      // CRITICAL: If input is clearly white but both matcher and model say gray, FORCE white
      else if ((modelIsGray || !modelFamily) && matcherIsGray) {
        // Check alternatives for white first
        if (matcherResult.alternatives) {
          const whiteAlternative = matcherResult.alternatives.find((alt: any) => {
            const altFamily = (alt.family || alt.name || '').toLowerCase();
            return /(white|snow|ivory|cream)/i.test(altFamily);
          });
          if (whiteAlternative && (whiteAlternative.confidence ?? 0) >= 50) {
            const altConfidence = whiteAlternative.confidence ?? 75;
            chosenFamily = whiteAlternative.family || whiteAlternative.name;
            finalConfidence = Math.max(altConfidence, 75); // Minimum 75% for white
          } else {
            // Force white family even if not in dataset - RGB clearly indicates white
            chosenFamily = 'White';
            finalConfidence = 85; // High confidence for white detection
          }
        } else {
          // No alternatives, but RGB is clearly white - force white
          chosenFamily = 'White';
          finalConfidence = 85;
        }
      }
    }
    
    // Balance between yellow and green: require strong evidence to flip green->yellow
    const familyLooksGreen = /green/i.test(chosenFamily) && !/yellow/i.test(chosenFamily);
    const nameSuggestsYellow = /(yellow|gold)/i.test(matcherResult.closest_match.name || '');
    const familySuggestsYellow = /(yellow|gold)/i.test(matcherResult.closest_match.family || '');
    if (!isWhite) {
      const yellowSignals = (isYellowHue ? 1 : 0) + (nameSuggestsYellow ? 1 : 0) + (familySuggestsYellow ? 1 : 0);
      if (yellowSignals >= 2 && isYellowHue && familyLooksGreen) {
        chosenFamily = 'Yellow';
      }
      // If hue is lime/greenish and result is Yellow, prefer Green
      if (isLimeHue && /yellow/i.test(chosenFamily) && !/green/i.test(chosenFamily)) {
        chosenFamily = 'Green';
      }
    }

    // If families disagree and the model thinks it's gray/neutral but matcher finds a vivid color,
    // prefer the matcher family to avoid "Family of: Gray" false positives.
    if (!familiesMatch && !isWhite) {
      if (modelIsNeutral && !matcherIsNeutral) {
        chosenFamily = datasetFamily || chosenFamily;
      } else if (!modelFamily && datasetFamily) {
        chosenFamily = datasetFamily;
      } else if (matcherConfidence >= 75 && confidenceFromModel < 60) {
        // If matcher is very confident and model is uncertain, prefer matcher
        chosenFamily = datasetFamily || chosenFamily;
      }
    }
    
    // Determine realName - use meaningful labels when we override families (e.g., White, Yellow)
    let finalRealName = matcherResult.closest_match.name;
    if (isWhite && chosenFamily === 'White' && !matcherIsWhite) {
      finalRealName = 'White';
    } else if (!isWhite && chosenFamily === 'Yellow' && !/yellow/i.test(finalRealName)) {
      finalRealName = 'Yellow';
    }
    
    return { 
      family: chosenFamily, 
      hex: matcherResult.closest_match.hex, 
      realName: finalRealName, 
      score, 
      confidence: finalConfidence,
      // Add detected RGB for comparison view
      detectedRgb: { r: rgb.r, g: rgb.g, b: rgb.b },
      matchedHex: matcherResult.closest_match.hex
    };
  } catch (e) {
    log("ColorDetectorInference: Error:", e);
    // Try native matcher as last resort (should always work)
    try { 
      const match = await findClosestColorNative([rgb.r, rgb.g, rgb.b], 3); 
      return { 
        family: match.closest_match.family || match.closest_match.name, 
        hex: match.closest_match.hex, 
        realName: match.closest_match.name, 
        confidence: match.closest_match.confidence,
        detectedRgb: { r: rgb.r, g: rgb.g, b: rgb.b },
        matchedHex: match.closest_match.hex
      } 
    } catch (_e2) {
      // If native matcher also fails, return null
      log("ColorDetectorInference: Native matcher also failed:", _e2);
      return null
    }
  }
}

export default { inferColorFromRGB }
