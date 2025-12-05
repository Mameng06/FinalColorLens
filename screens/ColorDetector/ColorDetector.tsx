import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Platform, PermissionsAndroid, Image, PanResponder, Animated, ActivityIndicator, Alert, BackHandler } from 'react-native';
let RNExitApp: any = null;
try {
  const maybe = require('react-native-exit-app');
  RNExitApp = maybe?.default ?? maybe;
} catch (_e) {
  RNExitApp = null;
}
let captureRef: any = null;
try { captureRef = require('react-native-view-shot').captureRef; } catch (_e) { captureRef = null; }
import { ICONS } from '../../Images';

// Settings Icon Component using SVG path
let Svg: any = null;
let Path: any = null;
try {
  const svgModule = require('react-native-svg');
  Svg = svgModule.Svg;
  Path = svgModule.Path;
} catch (_e) {
  Svg = null;
  Path = null;
}

const SettingsIcon: React.FC<{ size?: number; color?: string }> = ({ size = 32, color = '#000' }) => {
  if (Svg && Path) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.2788 2.15224C13.9085 2 13.439 2 12.5 2C11.561 2 11.0915 2 10.7212 2.15224C10.2274 2.35523 9.83509 2.74458 9.63056 3.23463C9.53719 3.45834 9.50065 3.7185 9.48635 4.09799C9.46534 4.65568 9.17716 5.17189 8.69017 5.45093C8.20318 5.72996 7.60864 5.71954 7.11149 5.45876C6.77318 5.2813 6.52789 5.18262 6.28599 5.15102C5.75609 5.08178 5.22018 5.22429 4.79616 5.5472C4.47814 5.78938 4.24339 6.1929 3.7739 6.99993C3.30441 7.80697 3.06967 8.21048 3.01735 8.60491C2.94758 9.1308 3.09118 9.66266 3.41655 10.0835C3.56506 10.2756 3.77377 10.437 4.0977 10.639C4.57391 10.936 4.88032 11.4419 4.88029 12C4.88026 12.5581 4.57386 13.0639 4.0977 13.3608C3.77372 13.5629 3.56497 13.7244 3.41645 13.9165C3.09108 14.3373 2.94749 14.8691 3.01725 15.395C3.06957 15.7894 3.30432 16.193 3.7738 17C4.24329 17.807 4.47804 18.2106 4.79606 18.4527C5.22008 18.7756 5.75599 18.9181 6.28589 18.8489C6.52778 18.8173 6.77305 18.7186 7.11133 18.5412C7.60852 18.2804 8.2031 18.27 8.69012 18.549C9.17714 18.8281 9.46533 19.3443 9.48635 19.9021C9.50065 20.2815 9.53719 20.5417 9.63056 20.7654C9.83509 21.2554 10.2274 21.6448 10.7212 21.8478C11.0915 22 11.561 22 12.5 22C13.439 22 13.9085 22 14.2788 21.8478C14.7726 21.6448 15.1649 21.2554 15.3694 20.7654C15.4628 20.5417 15.4994 20.2815 15.5137 19.902C15.5347 19.3443 15.8228 18.8281 16.3098 18.549C16.7968 18.2699 17.3914 18.2804 17.8886 18.5412C18.2269 18.7186 18.4721 18.8172 18.714 18.8488C19.2439 18.9181 19.7798 18.7756 20.2038 18.4527C20.5219 18.2105 20.7566 17.807 21.2261 16.9999C21.6956 16.1929 21.9303 15.7894 21.9827 15.395C22.0524 14.8691 21.9088 14.3372 21.5835 13.9164C21.4349 13.7243 21.2262 13.5628 20.9022 13.3608C20.4261 13.0639 20.1197 12.558 20.1197 11.9999C20.1197 11.4418 20.4261 10.9361 20.9022 10.6392C21.2263 10.4371 21.435 10.2757 21.5836 10.0835C21.9089 9.66273 22.0525 9.13087 21.9828 8.60497C21.9304 8.21055 21.6957 7.80703 21.2262 7C20.7567 6.19297 20.522 5.78945 20.2039 5.54727C19.7799 5.22436 19.244 5.08185 18.7141 5.15109C18.4722 5.18269 18.2269 5.28136 17.8887 5.4588C17.3915 5.71959 16.7969 5.73002 16.3099 5.45096C15.8229 5.17191 15.5347 4.65566 15.5136 4.09794C15.4993 3.71848 15.4628 3.45833 15.3694 3.23463C15.1649 2.74458 14.7726 2.35523 14.2788 2.15224ZM12.5 15C14.1695 15 15.5228 13.6569 15.5228 12C15.5228 10.3431 14.1695 9 12.5 9C10.8305 9 9.47716 10.3431 9.47716 12C9.47716 13.6569 10.8305 15 12.5 15Z"
          fill={color}
        />
      </Svg>
    );
  }
  // Fallback if react-native-svg is not available
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.7, color }}>⚙️</Text>
    </View>
  );
};
import { styles, REFERENCE_BOX_DEFAULT_SIZE, REFERENCE_BOX_MIN_SIZE, REFERENCE_BOX_MAX_SIZE, PIXELS_PER_INCH, rf } from './ColorDetector.styles';
import { getFallbackColor, getJpegUtils, getJpegOrientation, decodeJpegAndSampleCenter as _decodeCenter, decodeJpegAndSampleAt as _decodeAt, hexToRgb, rgbToHex, processWithIndicator, mapPressToPreviewCoords, mapLocalPressToPreviewCoords, isWhiteSurface, getWhiteSurfaceStatus, medianRgb, computeSimpleWhiteGains, setCalibratedGains, getCalibratedGains, clearCalibratedGains, applySimpleWhiteBalanceCorrection, fractionWhiteInSamples } from './ColorDetectorLogic';
import { findClosestColor } from '../../services/ColorMatcher';
import { findClosestColorAsync } from '../../services/ColorMatcherWorker';
import { inferColorFromRGB } from '../../services/ColorDetectorInference';
import { speak, initTts, stop as stopTts, setSuppressed } from '../../utils/tts';

let RNCamera: any = null;
let VisionCamera: any = null;
try { RNCamera = require('react-native-camera').RNCamera; } catch (err) { RNCamera = null; }
try { VisionCamera = require('react-native-vision-camera'); } catch (err) { VisionCamera = null; }
let runOnJS: any = null;
try { runOnJS = require('react-native-reanimated').runOnJS; } catch (_e) { runOnJS = null; }
let workletsCoreAvailable = false;
try {
  const wc = require('react-native-worklets-core');
  if (wc && typeof runOnJS === 'function') workletsCoreAvailable = true;
} catch (_e) { workletsCoreAvailable = false; }
import { CROSSHAIR_LENGTH_FACTOR, CROSSHAIR_LENGTH_FACTOR_FROZEN, CROSSHAIR_THICKNESS, CROSSHAIR_DOT_SIZE, CROSSHAIR_CONTAINER_SIZE } from './ColorDetector.styles';


interface ColorDetectorProps {
  onBack: () => void;
  openSettings: () => void;
  voiceEnabled?: boolean;
  colorCodesVisible?: boolean;
  voiceMode?: 'family' | 'real' | 'disable';
  showFamily?: boolean;
  showRealName?: boolean;
}

const ColorDetector: React.FC<ColorDetectorProps> = ({ onBack, openSettings, voiceEnabled=true, colorCodesVisible=true, voiceMode='family', showFamily=true, showRealName=true }) => {
  const insets = useSafeAreaInsets();
  const [detected, setDetected] = useState<{family:string,hex:string,realName:string,confidence?:number} | null>(null);
  const [liveDetected, setLiveDetected] = useState<{family:string,hex:string,realName:string,confidence?:number} | null>(null);
  const [frozenSnapshot, setFrozenSnapshot] = useState<{family:string,hex:string,realName:string,confidence?:number} | null>(null);
  const [freeze, setFreeze] = useState(false);
  const freezeRef = useRef<boolean>(false);
  const [crosshairPos, setCrosshairPos] = useState<{x:number,y:number}|null>(null);
  const intervalRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const previewLayout = useRef<{x:number,y:number,width:number,height:number}>({ x:0,y:0,width:0,height:0 });
  const previewRef = useRef<any>(null);
  
  const frozenImageUriRef = useRef<string | null>(null);
  const [previewSize, setPreviewSize] = useState<{width:number,height:number} | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [adjusting, setAdjusting] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [tapMarker, setTapMarker] = useState<{ x:number, y:number, id:number } | null>(null);
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const panResponder = useRef<any>(null);
  const [imageNaturalSize, setImageNaturalSize] = useState<{w:number,h:number} | null>(null);
  const [imageScaledSize, setImageScaledSize] = useState<{w:number,h:number} | null>(null);
  
  const suppressSpeechRef = useRef<boolean>(false);
  const warningSuppressedRef = useRef<boolean>(false);
  const freezeSpeakTimersRef = useRef<number[]>([]);
  const lastSpokenRef = useRef<number>(0);
  // Continuous voice output every 1.2 seconds during live detection
  const LIVE_SPEAK_COOLDOWN = 1200;
  const [cameraPermission, setCameraPermission] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<any[] | null>(null);
  const availableDevice = availableDevices ? availableDevices.find((d:any) => d.position === 'back') ?? availableDevices[0] : null;
  const permissionInitializedRef = useRef(false);
  const exitAppPendingRef = useRef(false);

  // Reference box states
  const [referenceBoxSizeInches, setReferenceBoxSizeInches] = useState<number>(REFERENCE_BOX_DEFAULT_SIZE);
  const [leftBoxEnabled, setLeftBoxEnabled] = useState<boolean>(true);
  const leftBoxEnabledRef = useRef<boolean>(true); // Keep in sync with state for use in async functions
  const [referenceBoxSamples, setReferenceBoxSamples] = useState<{left: {r:number,g:number,b:number}|null, right: {r:number,g:number,b:number}|null}>({left: null, right: null});
  const [whiteBalanceStatus, setWhiteBalanceStatus] = useState<{ status: 'ok' | 'too_dark' | 'not_white', message: string }>({ status: 'ok', message: '' });
  const whiteBalanceStatusRef = useRef<{ status: 'ok' | 'too_dark' | 'not_white', message: string }>({ status: 'ok', message: '' });
  const lastWarningSpokenRef = useRef<number>(0);
  
  // Calibration: gains are stored in ColorDetectorLogic; use getCalibratedGains()
  const [cameraExposureLocked, setCameraExposureLocked] = useState<boolean>(false);
  const WARNING_SPEAK_COOLDOWN = 2000;

  const processingFrameRef = useRef(false);
  const leftWhiteHistoryRef = useRef<number[]>([]);
  const LEFT_WHITE_HISTORY_SIZE = 5;
  const LEFT_WHITE_REQUIRED = 3; // need at least 3 of last 5 frames

  // Debug overlay state
  const [debugLeftMedian, setDebugLeftMedian] = useState<{r:number;g:number;b:number}|null>(null);
  const [debugLeftFraction, setDebugLeftFraction] = useState<number|null>(null);
  const [debugGains, setDebugGains] = useState<{gr:number;gg:number;gb:number}|null>(null);
  const [debugCorrectedRight, setDebugCorrectedRight] = useState<{r:number;g:number;b:number}|null>(null);
  const [debugRightRaw, setDebugRightRaw] = useState<{r:number;g:number;b:number}|null>(null);
  const [debugRightMatch, setDebugRightMatch] = useState<string | null>(null);
  const [debugSamplingBox, setDebugSamplingBox] = useState<{x:number, y:number, width:number, height:number} | null>(null);
  const [detectionDot, setDetectionDot] = useState<{x:number, y:number} | null>(null);
  // Temporary: store detected RGB for comparison view
  const [detectedRgb, setDetectedRgb] = useState<{r:number, g:number, b:number} | null>(null);

  const normalizeRgb = (rgb?: { r: number; g: number; b: number } | null) => {
    if (
      !rgb ||
      !Number.isFinite(rgb.r) ||
      !Number.isFinite(rgb.g) ||
      !Number.isFinite(rgb.b)
    ) {
      return null;
    }
    return {
      r: Math.round(rgb.r),
      g: Math.round(rgb.g),
      b: Math.round(rgb.b),
    };
  };

  // Use this wrapper to prevent accepting live detections when left-box white reference is enabled but invalid.
  const maybeSetLiveDetected = (val: {family:string,hex:string,realName:string,confidence?:number} | null) => {
    try {
      // Always allow explicit clears
      if (val === null) {
        setLiveDetected(null);
        return;
      }
      // If left-box white balance is enabled but not OK, skip accepting detection
      if (leftBoxEnabledRef.current && whiteBalanceStatusRef.current && whiteBalanceStatusRef.current.status !== 'ok') {
        return;
      }
      setLiveDetected(val);
    } catch (_e) {
      try { setLiveDetected(val); } catch (__e) {}
    }
  };

  const rgbArrayToObject = (values?: number[] | null) => {
    if (!Array.isArray(values) || values.length < 3) return null;
    return { r: values[0], g: values[1], b: values[2] };
  };

  const speakSelection = (sample: { family: string; hex: string; realName: string }) => {
    if (!sample) return;
    if (!voiceEnabled || voiceMode === 'disable') return;
    try {
      const text = voiceMode === 'real' ? sample.realName : sample.family;
      safeSpeak(text, { force: true });
      lastSpokenRef.current = Date.now();
      suppressSpeechRef.current = false;
    } catch (_err) {}
  };

  const applyManualSelection = (
    sample: { family: string; hex: string; realName: string; confidence?: number },
    rgb?: { r: number; g: number; b: number } | null,
    opts?: { speak?: boolean }
  ) => {
    setDetected(sample);
    setFrozenSnapshot(sample);
    try {
      const fromSample = normalizeRgb(rgb);
      const fallback = normalizeRgb(rgbArrayToObject(hexToRgb(sample.hex)));
      setDebugRightRaw(fromSample ?? fallback);
    } catch (_e) {
      try { setDebugRightRaw(null); } catch (_ignored) {}
    }
    if (opts?.speak) speakSelection(sample);
  };

  const clearManualSelection = () => {
    setDetected(null);
    setFrozenSnapshot(null);
    try { setDebugRightRaw(null); } catch (_e) {}
  };

  const rollingRightColorsRef = useRef<Array<{r:number;g:number;b:number}>>([]);
  // Detection history for stabilization - prevents oscillation between similar colors
  const detectionHistoryRef = useRef<Array<{family:string, realName:string, confidence?:number}>>([]);
  const STABLE_DETECTION_HISTORY_SIZE = 3; // Require 3 consistent detections before switching
  const MIN_CONFIDENCE_FOR_CHANGE = 60; // Require higher confidence to switch from stable color

  const rgbDist = (a: {r:number;g:number;b:number}, b: {r:number;g:number;b:number}) => {
    const dr = a.r - b.r; const dg = a.g - b.g; const db = a.b - b.b;
    return Math.sqrt(dr*dr + dg*dg + db*db);
  };

  // Check if a detection is consistent with history
  const isDetectionStable = (newDetection: {family:string, realName:string, confidence?:number}): boolean => {
    const history = detectionHistoryRef.current || [];
    if (history.length === 0) return true; // First detection is always stable
    
    // Check if new detection matches the most recent stable detection
    const lastStable = history[history.length - 1];
    const familyMatch = newDetection.family.toLowerCase() === lastStable.family.toLowerCase();
    const nameMatch = newDetection.realName.toLowerCase() === lastStable.realName.toLowerCase();
    
    // If it matches, it's stable
    if (familyMatch && nameMatch) return true;
    
    // If it doesn't match, check if we have enough consistent new detections
    const recentMatches = history.filter(d => 
      d.family.toLowerCase() === newDetection.family.toLowerCase() &&
      d.realName.toLowerCase() === newDetection.realName.toLowerCase()
    ).length;
    
    // Need at least 2 previous detections of the new color to switch
    return recentMatches >= 2;
  };

  // Add detection to history and return if it should be used
  const stabilizeDetection = (newDetection: {family:string, realName:string, confidence?:number}, detectedRgb?: {r:number, g:number, b:number}): {family:string, realName:string, confidence?:number} | null => {
    try {
      const history = detectionHistoryRef.current || [];
      
      // Check if detected color is clearly white - if so, prioritize it immediately
      const isDetectedWhite = detectedRgb ? (() => {
        const minVal = Math.min(detectedRgb.r, detectedRgb.g, detectedRgb.b);
        const maxVal = Math.max(detectedRgb.r, detectedRgb.g, detectedRgb.b);
        const delta = maxVal - minVal;
        return minVal >= 180 && delta <= 35;
      })() : false;
      
      const isWhiteFamily = /(white|snow|ivory|cream)/i.test(newDetection.family) || /(white|snow|ivory|cream)/i.test(newDetection.realName);
      
      // If clearly white is detected, use it immediately (don't wait for stabilization)
      if (isDetectedWhite && isWhiteFamily) {
        // Clear history to allow immediate white detection
        detectionHistoryRef.current = [newDetection];
        return newDetection;
      }
      
      // Add to history
      history.push(newDetection);
      while (history.length > STABLE_DETECTION_HISTORY_SIZE) history.shift();
      detectionHistoryRef.current = history;
      
      // If we have a stable detection, use it
      if (isDetectionStable(newDetection)) {
        return newDetection;
      }
      
      // If not stable yet, check if we should keep the last stable one
      if (history.length >= 2) {
        const lastStable = history[history.length - 2];
        // Only keep old detection if new one has low confidence
        if (newDetection.confidence && newDetection.confidence < MIN_CONFIDENCE_FOR_CHANGE) {
          return lastStable;
        }
      }
      
      // Otherwise, use the new detection (will stabilize on next frames)
      return newDetection;
    } catch (_e) {
      return newDetection;
    }
  };

  const temporalMedianPush = (c: {r:number;g:number;b:number}, size = 2): {r:number;g:number;b:number} => {
    try {
      const arr = rollingRightColorsRef.current || [];
      
      // If buffer is empty or color changed significantly, clear buffer for faster response
      if (arr.length > 0) {
        const lastColor = arr[arr.length - 1];
        const colorChange = rgbDist(c, lastColor);
        // If color changed by more than 30 RGB units, clear buffer (significant change)
        if (colorChange > 30) {
          arr.length = 0; // Clear buffer for faster response to new color
          detectionHistoryRef.current = []; // Also clear detection history on major color change
        }
      }
      
      arr.push(c);
      while (arr.length > size) arr.shift();
      rollingRightColorsRef.current = arr;
      // Use median for smoothing while maintaining responsiveness
      if (arr.length >= size) {
        const med = medianRgb(arr);
        return med || c;
      }
      return c;
    } catch (_e) { return c; }
  };

  const lumaOf = (c: {r:number;g:number;b:number}) => 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
  const variance = (vals: number[]) => {
    if (!vals.length) return 0;
    const mean = vals.reduce((a,b)=>a+b,0) / vals.length;
    return vals.reduce((s,v)=> s + (v-mean)*(v-mean), 0) / vals.length;
  };
  const filterOutliersAroundMedian = (samples: Array<{r:number;g:number;b:number}>, threshold = 35) => {
    if (!samples.length) return samples;
    const med = medianRgb(samples);
    if (!med) return samples;
    return samples.filter(s => rgbDist(s, med) <= threshold);
  };

  const pushLeftWhiteHistory = (isWhite: boolean) => {
    try {
      const arr = leftWhiteHistoryRef.current || [];
      arr.push(isWhite ? 1 : 0);
      while (arr.length > LEFT_WHITE_HISTORY_SIZE) arr.shift();
      leftWhiteHistoryRef.current = arr;
      const sum = arr.reduce((s,n) => s + n, 0);
      return sum >= LEFT_WHITE_REQUIRED;
    } catch (_e) { return !!isWhite; }
  };

  const safeSpeak = (text: string, opts?: { force?: boolean }) => {
    try { if (suppressSpeechRef.current && !(opts && opts.force)) return false; } catch (_e) {}
    try {
      const res = speak(text);
      return res;
    } catch (err) {
      return false;
    }
  };

  const safeWarningSpeak = (text: string) => {
    try {
      // Never speak warnings if left box is disabled or warnings are suppressed
      if (!leftBoxEnabledRef.current || warningSuppressedRef.current) return false;
      const now = Date.now();
      if (now - lastWarningSpokenRef.current < WARNING_SPEAK_COOLDOWN) return false;
      const res = speak(text);
      lastWarningSpokenRef.current = now;
      return res;
    } catch (err) {
      return false;
    }
  };

  const setWhiteBalanceStatusSafe = useCallback((status: { status: 'ok' | 'too_dark' | 'not_white', message: string }) => {
    whiteBalanceStatusRef.current = status;
    setWhiteBalanceStatus(status);
  }, []);

  const updateWhiteBalanceStatus = (r: number, g: number, b: number) => {
    // If left box is disabled, NEVER set any warning or speak anything
    try {
      if (!leftBoxEnabledRef.current) {
        // Aggressively clear status and suppress warning speech only
        setWhiteBalanceStatusSafe({ status: 'ok', message: '' });
        warningSuppressedRef.current = true;
        return;
      }
      const status = getWhiteSurfaceStatus(r, g, b, Boolean(getCalibratedGains()));
      setWhiteBalanceStatusSafe(status);
      // If left-box is enabled and status is not OK, clear any existing live detection
      if (status.status !== 'ok') {
        try { maybeSetLiveDetected(null); } catch (_e) {}
      }
      // Speak warning only when left-box is enabled and voice is enabled
      if (status.status !== 'ok' && voiceEnabled) {
        // Allow warning speech only when left box is explicitly enabled
        warningSuppressedRef.current = false;
        safeWarningSpeak(status.message);
      }
    } catch (_e) {
      // On error, do not surface a warning if left box is disabled
      if (!leftBoxEnabled) {
        setWhiteBalanceStatusSafe({ status: 'ok', message: '' });
        warningSuppressedRef.current = true;
      }
    }
  };

  // Calibration is automatic: computed and stored in ColorDetectorLogic when left box is detected as white

  // Lock camera exposure/white balance (VisionCamera API)
  const lockCameraExposure = async () => {
    try {
      if (!cameraRef.current) return;
      const ref = cameraRef.current as any;
      // VisionCamera: if supported, lock exposure/white balance
      if (ref.setExposureCompensation) {
        await ref.setExposureCompensation(0).catch(() => {});
      }
      // If camera supports white balance locking
      if (ref.setWhiteBalance) {
        await ref.setWhiteBalance('manual').catch(() => {});
      }
      setCameraExposureLocked(true);
    } catch (err) {
      console.error('Exposure lock error:', err);
    }
  };

  const handleReferenceBoxSizeChange = (delta: number) => {
    const newSize = Math.max(REFERENCE_BOX_MIN_SIZE, Math.min(REFERENCE_BOX_MAX_SIZE, referenceBoxSizeInches + delta));
    setReferenceBoxSizeInches(newSize);
  };

  const getReferenceBoxPixelSize = (): number => {
    return referenceBoxSizeInches * PIXELS_PER_INCH;
  };

  useEffect(() => { 
    try { initTts(); } catch (_e) {} 
    lockCameraExposure();
  }, []);
  // If the user disables the left box, immediately clear any white warnings and stop TTS
  useEffect(() => {
    try {
      leftBoxEnabledRef.current = leftBoxEnabled; // Keep ref in sync
      if (!leftBoxEnabled) {
        // When left-box is disabled we should NOT globally mute the TTS engine;
        // only suppress *warning* utterances. However, a previously queued
        // warning speak may still fire — cancel it and re-enable the engine so
        // detection speech still works.
        try { stopTts(); } catch (_e) {}
        try { setSuppressed(false); } catch (_e) {}
        warningSuppressedRef.current = true; // prevents future warning speech
        setWhiteBalanceStatusSafe({ status: 'ok', message: '' });
        clearCalibratedGains();
      } else {
        // Re-enable warning speech when left box is turned back on
        warningSuppressedRef.current = false;
        // Ensure TTS is available for warnings
        try { setSuppressed(false); } catch (_e) {}
      }
    } catch (_e) {}
  }, [leftBoxEnabled]);
  useEffect(() => { exitAppPendingRef.current = false; }, []);

  const processSnapshotAndSample = async (): Promise<boolean> => {
    try {
      if (cameraPermission !== 'authorized') return false;
      if (cameraError) return false;
      if (processingFrameRef.current) return false;
      if (freeze) return false;
      processingFrameRef.current = true;
      const ref = cameraRef.current as any;
      if (!ref) { processingFrameRef.current = false; return false; }
      let blobLike: any = null;
      try {
        if (ref.takeSnapshot) {
          blobLike = await ref.takeSnapshot({ quality: 0.25, skipMetadata: true, width: 320 });
        } else if (ref.takePhoto) {
          blobLike = await ref.takePhoto({ qualityPrioritization: 'speed', skipMetadata: true, width: 320 });
        } else if (ref.takePictureAsync) {
          blobLike = await ref.takePictureAsync({ quality: 0.3, base64: true, width: 320, doNotSave: true });
        }
      } catch (err) { blobLike = null; }
      if (!blobLike) { processingFrameRef.current = false; return false; }
      if (cameraError) setCameraError(null);
      let base64: string | null = null;
      // clear previous per-pass debug entries
      try { setDebugRightRaw(null); setDebugRightMatch(null); setDebugSamplingBox(null); setDetectionDot(null); } catch (_e) {}
      // Clear any left-box debug/white status (no longer used)
      try {
        try { setDebugLeftMedian(null); } catch (_e) {}
        try { setDebugLeftFraction(null); } catch (_e) {}
        try { leftWhiteHistoryRef.current = []; } catch (_e) {}
        try { setWhiteBalanceStatusSafe({ status: 'ok', message: '' }); } catch (_e) {}
      } catch (_e) {}
      let uri: string | undefined = blobLike?.path || blobLike?.uri || blobLike?.localUri || blobLike?.filePath || blobLike?.file;
      try { if (uri && typeof uri === 'string' && uri.startsWith('/')) uri = 'file://' + uri; } catch (_e) {}
      try {
        console.log('[ColorDetector] blobLike snapshot:', { path: blobLike?.path || blobLike?.uri || blobLike?.localUri || blobLike?.filePath || blobLike?.file, hasBase64: !!blobLike?.base64 });
        if (uri && typeof uri === 'string' && (uri.startsWith('file://') || uri.startsWith('content://'))) {
          try {
            const normalizedUri = (uri.startsWith('/') ? ('file://' + uri) : uri);
            const { decodeScaledRegion } = require('../../services/ImageDecoder');
            if (typeof decodeScaledRegion === 'function') {
              const pw = previewLayout.current?.width || 0;
              const ph = previewLayout.current?.height || 0;
              console.log('[ColorDetector] native decode branch, preview size:', { pw, ph });
              
              // Two-box system: left box for white balance, right box for color detection
              const boxSizePixels = referenceBoxSizeInches * PIXELS_PER_INCH;
              const boxHalfSize = boxSizePixels / 2;
              
              // Left box: 25% from left edge, 50% from top (center vertically)
              const leftBoxRelX = pw * 0.25;
              const leftBoxRelY = ph * 0.5;
              
              // Right box: 75% from left edge, 50% from top (center vertically)
              const rightBoxRelX = pw * 0.75;
              const rightBoxRelY = ph * 0.5;
              
              // Sample from left box (for white balance calibration)
              let leftBoxSample: {r:number;g:number;b:number} | null = null;
              if (leftBoxEnabledRef.current) {
                const leftSamples: Array<{r:number;g:number;b:number}> = [];
                const gridRadius = Math.max(2, Math.floor(boxHalfSize * 0.25));
                const steps = 1;
                for (let gy = -steps; gy <= steps; gy++) {
                  for (let gx = -steps; gx <= steps; gx++) {
                    const sx = leftBoxRelX + (gx * gridRadius);
                    const sy = leftBoxRelY + (gy * gridRadius);
                    // eslint-disable-next-line no-await-in-loop
                    const s = await decodeScaledRegion(normalizedUri, sx, sy, pw, ph);
                    if (s && typeof s.r === 'number') leftSamples.push(s);
                  }
                }
                const leftFiltered = filterOutliersAroundMedian(leftSamples, 35);
                leftBoxSample = medianRgb(leftFiltered);
                
                // Check if left box is white and update status
                if (leftBoxSample) {
                  const isWhite = isWhiteSurface(leftBoxSample.r, leftBoxSample.g, leftBoxSample.b);
                  const status = getWhiteSurfaceStatus(leftBoxSample.r, leftBoxSample.g, leftBoxSample.b, Boolean(getCalibratedGains()));
                  updateWhiteBalanceStatus(leftBoxSample.r, leftBoxSample.g, leftBoxSample.b);
                  
                  // If white, use it for calibration - use Color Meter approach for accuracy
                  if (isWhite) {
                    // Use Color Meter approach: gains = 255 / white_channel (more accurate)
                    const gains = computeSimpleWhiteGains(leftBoxSample.r, leftBoxSample.g, leftBoxSample.b);
                    setCalibratedGains(gains, true);
                  } else {
                    // Don't clear gains immediately - keep using last calibration for better accuracy
                    // clearCalibratedGains();
                  }
                  // Don't block right box detection based on left box status
                  // Allow detection to proceed even if left box is not white
                  // if (status.status !== 'ok') {
                  //   processingFrameRef.current = false;
                  //   return false;
                  // }
                }
              } else {
                // Left box disabled - clear status
                setWhiteBalanceStatusSafe({ status: 'ok', message: '' });
                clearCalibratedGains();
              }
              
              // Sample from right box (for color detection)
              const gridRadius = Math.max(2, Math.floor(boxHalfSize * 0.3));
              const steps = 1;
              const rightSamples: Array<{r:number;g:number;b:number}> = [];
              for (let gy = -steps; gy <= steps; gy++) {
                for (let gx = -steps; gx <= steps; gx++) {
                  const sx = rightBoxRelX + (gx * gridRadius);
                  const sy = rightBoxRelY + (gy * gridRadius);
                  // eslint-disable-next-line no-await-in-loop
                  const s = await decodeScaledRegion(normalizedUri, sx, sy, pw, ph);
                  if (s && typeof s.r === 'number') rightSamples.push(s);
                }
              }
              
              // Set debug box to show right sampling area
              const sampleVisSize = boxSizePixels * 0.65;
              setDebugSamplingBox({ x: rightBoxRelX - sampleVisSize / 2, y: rightBoxRelY - sampleVisSize / 2, width: sampleVisSize, height: sampleVisSize });
              
              // Show green dot at exact detection point (center of right box)
              setDetectionDot({ x: rightBoxRelX, y: rightBoxRelY });
              setTimeout(() => {
                setDetectionDot(null);
              }, 2000);
              
              const filtered = filterOutliersAroundMedian(rightSamples, 35);
              const lumas = filtered.map(s => lumaOf(s));
              const edgeEnergy = variance(lumas);
              if (filtered.length < 5 || edgeEnergy < 3) {
                // Likely too blurry or too few valid samples; skip this frame
                processingFrameRef.current = false;
                return false;
              }
              let centerSample = medianRgb(filtered);
              console.log(`[ColorDetector Native] Center sample result (median of ${filtered.length}, edgeEnergy=${edgeEnergy.toFixed(2)}):`, centerSample ? `${centerSample.r},${centerSample.g},${centerSample.b}` : 'null');
              try { setDebugRightRaw(centerSample); setDebugRightMatch(null); } catch (_e) {}
              // If native decode fails, try a JPEG decode fallback immediately
              if (!centerSample) {
                try {
                  console.log('[ColorDetector Native] decodeScaledRegion returned null — trying JPEG fallback');
                  const RNFS = require('react-native-fs');
                  const base64 = await RNFS.readFile(normalizedUri.replace('file://',''), 'base64');
                  const { jpegjs: _jpegjs, BufferShim: _BufferShim } = getJpegUtils();
                  if (_jpegjs && _BufferShim && base64) {
                    const buffer = _BufferShim.from(base64, 'base64');
                    const decoded = _jpegjs.decode(buffer, { useTArray: true });
                    if (decoded && decoded.width && decoded.data) {
                      const w = decoded.width; const h = decoded.height; const data = decoded.data;
                      const cx = Math.floor((rightBoxRelX / pw) * w);
                      const cy = Math.floor((rightBoxRelY / ph) * h);
                      const cRadius = Math.max(1, Math.floor(Math.min(w, h) * 0.02));
                      const samples: Array<{r:number;g:number;b:number}> = [];
                      for (let yy = Math.max(0, cy - cRadius); yy <= Math.min(h-1, cy + cRadius); yy++) {
                        for (let xx = Math.max(0, cx - cRadius); xx <= Math.min(w-1, cx + cRadius); xx++) {
                          const idx = (yy * w + xx) * 4;
                          samples.push({ r: data[idx], g: data[idx+1], b: data[idx+2] });
                        }
                      }
                      if (samples.length > 0) {
                        const median = medianRgb(samples);
                        console.log('[ColorDetector Native] JPEG fallback median:', median ? `${median.r},${median.g},${median.b}` : 'null');
                        if (median) {
                          try { setDebugRightRaw(median); } catch (_e) {}
                          // proceed to inference/matcher fallback below by assigning centerSample-like object
                          // reuse variable name for downstream logic
                          // @ts-ignore
                          centerSample = median;
                        }
                      }
                    }
                  }
                } catch (_e) { console.log('[ColorDetector Native] JPEG fallback failed:', _e); }
              }
              if (centerSample && typeof centerSample.r === 'number') {
                // Apply white balance correction using the most recent calibration (even if left box is hidden)
                // Use Color Meter approach: simple multiplication for accurate color normalization
                let correctedSample = centerSample;
                const gains = getCalibratedGains();
                if (gains) {
                  // Use simple white balance correction (Color Meter approach) for better accuracy
                  const corrected = applySimpleWhiteBalanceCorrection(centerSample, gains);
                  correctedSample = corrected;
                }
                // Use small buffer (2 samples) for smoothing while maintaining responsiveness
                const sampleForInference = temporalMedianPush(correctedSample, 2);
                const sampleForDisplay = sampleForInference || correctedSample;
                try { setDebugCorrectedRight(sampleForInference); } catch (_e) {}
                console.log(`[ColorDetector Native] About to infer color`);
                const inferred = await inferColorFromRGB({ r: sampleForInference.r, g: sampleForInference.g, b: sampleForInference.b }).catch((e) => {
                  console.log(`[ColorDetector Native] Inference error:`, e);
                  return null;
                });
                console.log(`[ColorDetector Native] Inferred:`, inferred ? inferred.realName : 'null');
                if (inferred) {
                  // Stabilize detection to prevent oscillation - pass RGB to prioritize white detection
                  const stabilized = stabilizeDetection({
                    family: inferred.family,
                    realName: inferred.realName,
                    confidence: inferred.confidence
                  }, sampleForInference);
                  
                  if (stabilized) {
                    const live = { 
                      family: stabilized.family, 
                      hex: inferred.hex, 
                      realName: stabilized.realName, 
                      confidence: stabilized.confidence || inferred.confidence 
                    };
                    try { setDebugRightMatch(stabilized.realName || stabilized.family || inferred.hex || null); } catch (_e) {}
                    
                    // If left-box white balance is enabled but not OK, skip accepting detection
                    if (leftBoxEnabledRef.current && whiteBalanceStatusRef.current && whiteBalanceStatusRef.current.status !== 'ok') {
                      processingFrameRef.current = false;
                      return false;
                    }
                    // Store detected RGB for comparison view
                    setDetectedRgb(sampleForDisplay);
                    
                    // Clear temporal buffer if color family changed significantly (faster response)
                    if (liveDetected && liveDetected.family !== stabilized.family) {
                      rollingRightColorsRef.current = [];
                      // Also clear detection history on significant color change (e.g., brown to white)
                      detectionHistoryRef.current = [];
                    }
                    
                    if (!freeze) maybeSetLiveDetected(live);
                    processingFrameRef.current = false;
                    return true;
                  }
                }
                // Fallback: try matcher-based nearest color
                try {
                  const match = await findClosestColorAsync([sampleForInference.r, sampleForInference.g, sampleForInference.b], 3).catch(() => null);
                  console.log(`[ColorDetector Native] Matcher fallback:`, match ? match.closest_match : null);
                  if (match && match.closest_match) {
                    const cm = match.closest_match;
                    // Stabilize detection to prevent oscillation - pass RGB to prioritize white detection
                    const stabilized = stabilizeDetection({
                      family: cm.family || cm.name,
                      realName: cm.name,
                      confidence: cm.confidence
                    }, sampleForInference);
                    
                    if (stabilized) {
                      const live = { 
                        family: stabilized.family, 
                        hex: cm.hex, 
                        realName: stabilized.realName, 
                        confidence: stabilized.confidence || cm.confidence 
                      };
                      try { setDebugRightMatch(stabilized.realName || stabilized.family || cm.hex || null); } catch (_e) {}
                      
                      // If left-box white balance is enabled but not OK, skip accepting detection
                      if (leftBoxEnabledRef.current && whiteBalanceStatusRef.current && whiteBalanceStatusRef.current.status !== 'ok') {
                        processingFrameRef.current = false;
                        return false;
                      }
                      // Store detected RGB for comparison view
                      setDetectedRgb(sampleForDisplay);
                      
                      // Clear temporal buffer if color family changed significantly (faster response)
                      if (liveDetected && liveDetected.family !== stabilized.family) {
                        rollingRightColorsRef.current = [];
                        // Also clear detection history on significant color change (e.g., brown to white)
                        detectionHistoryRef.current = [];
                      }
                      
                      if (!freeze) maybeSetLiveDetected(live);
                      processingFrameRef.current = false;
                      return true;
                    }
                  }
                } catch (_e) {}
              }
            }
          } catch (nativeErr) {
            console.log('[ColorDetector] ERROR in native decode block:', nativeErr);
          }
        }
      } catch (_e) {}
      if (blobLike?.base64) base64 = blobLike.base64;
      if (!base64 && uri && typeof uri === 'string' && uri.startsWith('file://')) {
        try { const RNFS = require('react-native-fs'); base64 = await RNFS.readFile(uri.replace('file://',''), 'base64'); } catch (_e) {}
      }
      if (!base64) { processingFrameRef.current = false; return false; }
      try {
        const { jpegjs: _jpegjs, BufferShim: _BufferShim } = getJpegUtils();
        if (!_jpegjs || !_BufferShim) { processingFrameRef.current = false; return false; }
        if (base64.length > 5_000_000) { processingFrameRef.current = false; return false; }
        const buffer = _BufferShim.from(base64, 'base64');
        const decoded = _jpegjs.decode(buffer, { useTArray: true });
        if (!decoded || !decoded.width || !decoded.data) { processingFrameRef.current = false; return false; }
        const w = decoded.width; const h = decoded.height; const data = decoded.data;
        
        // Two-box system: left box for white balance, right box for color detection
        const boxSizePixels = referenceBoxSizeInches * PIXELS_PER_INCH;
        const boxHalfSize = boxSizePixels / 2;
        const pw = previewLayout.current?.width || previewSize?.width || w;
        const ph = previewLayout.current?.height || previewSize?.height || h;
        
        // Left box: 25% from left edge, 50% from top
        const leftBoxX = Math.floor(w * 0.25);
        const leftBoxY = Math.floor(h * 0.5);
        const leftBoxRadius = Math.max(2, Math.floor(boxHalfSize * 0.3 * (w / pw)));
        
        // Right box: 75% from left edge, 50% from top
        const rightBoxX = Math.floor(w * 0.75);
        const rightBoxY = Math.floor(h * 0.5);
        const rightBoxRadius = Math.max(2, Math.floor(boxHalfSize * 0.3 * (w / pw)));
        
        // Sample from left box (for white balance calibration)
        let leftBoxSample: {r:number;g:number;b:number} | null = null;
        if (leftBoxEnabled) {
          const leftSamples: Array<{r:number;g:number;b:number}> = [];
          for (let yy = Math.max(0, leftBoxY - leftBoxRadius); yy <= Math.min(h-1, leftBoxY + leftBoxRadius); yy++) {
            for (let xx = Math.max(0, leftBoxX - leftBoxRadius); xx <= Math.min(w-1, leftBoxX + leftBoxRadius); xx++) {
              const idx = (yy * w + xx) * 4;
              leftSamples.push({ r: data[idx], g: data[idx+1], b: data[idx+2] });
            }
          }
          const leftFiltered = filterOutliersAroundMedian(leftSamples, 35);
          leftBoxSample = medianRgb(leftFiltered);
          
          // Check if left box is white and update status
          if (leftBoxSample) {
            updateWhiteBalanceStatus(leftBoxSample.r, leftBoxSample.g, leftBoxSample.b);
            const isWhite = isWhiteSurface(leftBoxSample.r, leftBoxSample.g, leftBoxSample.b);
            if (isWhite) {
              // Use Color Meter approach: gains = 255 / white_channel (more accurate)
              const gains = computeSimpleWhiteGains(leftBoxSample.r, leftBoxSample.g, leftBoxSample.b);
              setCalibratedGains(gains, true);
            } else {
              // Don't clear gains immediately - keep using last calibration for better accuracy
              // clearCalibratedGains();
            }
            // Don't block right box detection based on left box status
            // Allow detection to proceed even if left box is not white
            // if (whiteBalanceStatusRef.current.status !== 'ok') {
            //   processingFrameRef.current = false;
            //   return false;
            // }
          }
        } else {
          setWhiteBalanceStatusSafe({ status: 'ok', message: '' });
          clearCalibratedGains();
        }
        
        // Sample from right box (for color detection)
        // Set debug box to show sampling area (convert from image coords to preview coords)
        if (previewSize) {
          const rightBoxRelX = pw * 0.75;
          const rightBoxRelY = ph * 0.5;
          const boxSize = boxSizePixels * 0.65;
          setDebugSamplingBox({ x: rightBoxRelX - boxSize/2, y: rightBoxRelY - boxSize/2, width: boxSize, height: boxSize });
          
          // Show green dot at exact detection point (center of right box)
          setDetectionDot({ x: rightBoxRelX, y: rightBoxRelY });
          setTimeout(() => {
            setDetectionDot(null);
          }, 2000);
        }
        const centerSamples: Array<{r:number;g:number;b:number}> = [];
        for (let yy = Math.max(0, rightBoxY - rightBoxRadius); yy <= Math.min(h-1, rightBoxY + rightBoxRadius); yy++) {
          for (let xx = Math.max(0, rightBoxX - rightBoxRadius); xx <= Math.min(w-1, rightBoxX + rightBoxRadius); xx++) {
            const idx = (yy * w + xx) * 4;
            centerSamples.push({ r: data[idx], g: data[idx+1], b: data[idx+2] });
          }
        }
        console.log(`[ColorDetector] Center samples collected: ${centerSamples.length}`);
        if (centerSamples.length > 0) {
          const centerSampled = medianRgb(centerSamples);
          console.log(`[ColorDetector] Center median RGB: ${centerSampled ? `${centerSampled.r},${centerSampled.g},${centerSampled.b}` : 'null'}`);
          if (centerSampled) {
            try { setDebugRightRaw(centerSampled); setDebugRightMatch(null); } catch (_e) {}
            // Apply white balance correction using the latest calibration (even if left box UI is disabled)
            let correctedSampled = centerSampled;
            const gains = getCalibratedGains();
            if (gains) {
              const corrected = applySimpleWhiteBalanceCorrection(centerSampled, gains);
              correctedSampled = corrected;
            }
            try { setDebugCorrectedRight(correctedSampled); } catch (_e) {}
            console.log(`[ColorDetector] About to infer color from: ${correctedSampled.r},${correctedSampled.g},${correctedSampled.b}`);
            const inferred = await inferColorFromRGB({ r: correctedSampled.r, g: correctedSampled.g, b: correctedSampled.b }).catch((e) => {
              console.log(`[ColorDetector] Inference error:`, e);
              return null;
            });
            console.log(`[ColorDetector] Inferred result:`, inferred ? inferred.realName : 'null');
            if (inferred) {
              // Stabilize detection to prevent oscillation - pass RGB to prioritize white detection
              const stabilized = stabilizeDetection({
                family: inferred.family,
                realName: inferred.realName,
                confidence: inferred.confidence
              }, correctedSampled);
              
                if (stabilized) {
                const live = { 
                  family: stabilized.family, 
                  hex: inferred.hex, 
                  realName: stabilized.realName, 
                  confidence: stabilized.confidence || inferred.confidence 
                };
                
                // Clear temporal buffer if color family changed significantly (faster response)
                if (liveDetected && liveDetected.family !== stabilized.family) {
                  rollingRightColorsRef.current = [];
                  // Also clear detection history on significant color change (e.g., brown to white)
                  detectionHistoryRef.current = [];
                }

                if (!freeze) {
                  // If left-box white balance is enabled but not OK, skip accepting detection
                  if (leftBoxEnabledRef.current && whiteBalanceStatusRef.current && whiteBalanceStatusRef.current.status !== 'ok') {
                    processingFrameRef.current = false;
                    return false;
                  }
                  maybeSetLiveDetected(live);
                }
                processingFrameRef.current = false;
                return true;
              }
            }
          }
        }
      } catch (err) {}
      processingFrameRef.current = false;
      return false;
    } catch (err) { processingFrameRef.current = false; return false; }
  };

  const sampleFromPreviewSnapshot = async (relX: number, relY: number): Promise<{r:number,g:number,b:number}|null> => {
    try {
      if (!captureRef) return null;
      if (!previewRef.current) return null;
      const pw = previewLayout.current.width || 0;
      const ph = previewLayout.current.height || 0;
      if (!pw || !ph) return null;
      const tmp = await captureRef(previewRef.current, { format: 'png', quality: 0.9, result: 'tmpfile', width: Math.round(pw), height: Math.round(ph) });
      if (!tmp) return null;
      const normalized = (typeof tmp === 'string' && tmp.startsWith('/')) ? ('file://' + tmp) : tmp;
      try {
        const { decodeScaledRegion } = require('../../services/ImageDecoder');
        if (typeof decodeScaledRegion === 'function') {
          const nativeSample = await decodeScaledRegion(normalized, relX, relY, pw, ph);
          if (nativeSample && typeof nativeSample.r === 'number') return { r: nativeSample.r, g: nativeSample.g, b: nativeSample.b };
        }
      } catch (err) {}
      return null;
    } catch (err) { return null; }
  };

  let frameProcessor: any = null;
  try {
    if (workletsCoreAvailable && VisionCamera && (VisionCamera as any).useFrameProcessor) {
      const useFP = (VisionCamera as any).useFrameProcessor;
      frameProcessor = useFP((frame: any) => {
        'worklet';
        if ((globalThis as any).__clFPCount == null) (globalThis as any).__clFPCount = 0;
        (globalThis as any).__clFPCount = ((globalThis as any).__clFPCount + 1) | 0;
        if (((globalThis as any).__clFPCount % 20) !== 0) return;
        try { if (typeof runOnJS === 'function') runOnJS(processSnapshotAndSample)(); } catch (_e) {}
      }, []);
    }
  } catch (_e) { frameProcessor = null; }

  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const has = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
          setCameraPermission(has ? 'authorized' : 'denied');
        } else if (VisionCamera) {
          if (VisionCamera.getCameraPermissionStatus) {
            const status = await VisionCamera.getCameraPermissionStatus();
            setCameraPermission(status);
          } else if (VisionCamera.Camera && VisionCamera.Camera.getCameraPermissionStatus) {
            const status = await VisionCamera.Camera.getCameraPermissionStatus();
            setCameraPermission(status);
          } else setCameraPermission(null);
        }
      } catch (err) { setCameraPermission(null); }
      permissionInitializedRef.current = true;
    };
    checkPermission();
    try {
      const probe = async () => {
        try { const { pingWorker } = require('../../services/ColorMatcherWorker'); if (typeof pingWorker === 'function') await pingWorker(500); } catch (_e) {}
      };
      probe();
    } catch (_e) {}
    return () => {
      stopDetection();
      try {
        const ref = cameraRef.current as any;
        if (ref) {
          if (typeof ref.stopPreview === 'function') try { ref.stopPreview(); } catch (_e) {}
          if (typeof ref.pausePreview === 'function') try { ref.pausePreview(); } catch (_e) {}
          try { cameraRef.current = null; } catch (_e) {}
        }
      } catch (_e) {}
    };
  }, []);

  useEffect(() => {
    const discover = async () => {
      if (!VisionCamera) return;
      if (cameraPermission !== 'authorized') return;
      try {
        if (VisionCamera.getAvailableCameraDevices) {
          const list = await VisionCamera.getAvailableCameraDevices(); setAvailableDevices(list ?? null); return;
        }
        if (VisionCamera.Camera && VisionCamera.Camera.getAvailableCameraDevices) {
          const list = await VisionCamera.Camera.getAvailableCameraDevices(); setAvailableDevices(list ?? null); return;
        }
      } catch (err) {}
    };
    discover();
    if (cameraPermission === 'authorized') startDetection();
    else stopDetection();
  }, [cameraPermission]);

  // When left-box is disabled we want to avoid erasing the last-good detection
  // on a single transient sampling failure. Hold a short debounce timeout
  // before clearing `liveDetected` to make right-only mode more stable.
  const debounceClearRef = useRef<number | null>(null);

  // Continuous voice output every 1.2 seconds during live detection
  useEffect(() => {
    if (!voiceEnabled || freeze) return;
    const currentVoiceMode = voiceMode;
    if (currentVoiceMode === 'disable') return;
    
    // Set up interval for continuous voice output
    const voiceInterval = setInterval(() => {
      if (!liveDetected || freeze) return;
      
      try {
        const now = Date.now();
        if (now - lastSpokenRef.current >= LIVE_SPEAK_COOLDOWN) {
          const textToSpeak = currentVoiceMode === 'real' ? liveDetected.realName : liveDetected.family;
          const ok = safeSpeak(textToSpeak);
          if (ok) {
            lastSpokenRef.current = now;
          }
        }
      } catch (err) {}
    }, LIVE_SPEAK_COOLDOWN);
    
    // Also speak immediately when color changes
    if (liveDetected) {
      try {
        const now = Date.now();
        if (now - lastSpokenRef.current >= LIVE_SPEAK_COOLDOWN) {
          const textToSpeak = currentVoiceMode === 'real' ? liveDetected.realName : liveDetected.family;
          const ok = safeSpeak(textToSpeak);
          if (ok) {
            lastSpokenRef.current = now;
          }
        }
      } catch (err) {}
    }
    
    return () => {
      clearInterval(voiceInterval);
    };
  }, [liveDetected, voiceEnabled, freeze, voiceMode]);

  const startDetection = () => {
    stopDetection();
    intervalRef.current = setInterval(() => {
      if (!freezeRef.current) {
        processSnapshotAndSample().then((ok) => {
          if (ok) {
            // successful sample — clear any pending debounce
            try { if (debounceClearRef.current) { clearTimeout(debounceClearRef.current as any); debounceClearRef.current = null; } } catch (_e) {}
            return;
          }
          // Schedule a short debounce clear so intermittent misses don't erase the last known detection immediately
          try {
            if (debounceClearRef.current) { clearTimeout(debounceClearRef.current as any); debounceClearRef.current = null; }
            debounceClearRef.current = setTimeout(() => { try { maybeSetLiveDetected(null); } catch (_e) {} debounceClearRef.current = null; }, 800) as unknown as number;
          } catch (_e) { maybeSetLiveDetected(null); }
        }).catch(() => {
          maybeSetLiveDetected(null);
        });
      }
    }, 200);
  };

  const stopDetection = () => { if (intervalRef.current) clearInterval(intervalRef.current); intervalRef.current = null; };

  const toggleFreeze = () => {
    const next = !freeze;
    setFreeze(next);
    freezeRef.current = next;
    suppressSpeechRef.current = next;
    if (!next) {
      setFrozenSnapshot(null);
      frozenImageUriRef.current = null;
      setSelectedImageUri(null);
      setDebugSamplingBox(null);
      if (previewSize) {
        setCrosshairPos({ x: previewSize.width / 2, y: previewSize.height / 2 });
      } else {
        setCrosshairPos(null);
      }
    }
    else {
      setTimeout(() => {
        try {
          if (previewRef.current && previewRef.current.measureInWindow) {
            previewRef.current.measureInWindow((px: number, py: number, pw: number, ph: number) => {
              previewLayout.current = { x: px, y: py, width: pw, height: ph };
              const center = { x: pw / 2, y: ph / 2 };
              setCrosshairPos(center);
              setFrozenSnapshot(liveDetected ?? detected);
              (async () => {
                try {
                  const ref: any = cameraRef.current;
                  if (ref && (ref.takeSnapshot || ref.takePhoto || ref.takePicture || ref.takePictureAsync || ref.capture)) {
                    const take = ref.takeSnapshot ? 'takeSnapshot' : ref.takePhoto ? 'takePhoto' : ref.takePicture ? 'takePicture' : ref.takePictureAsync ? 'takePictureAsync' : 'capture';
                    try {
                      const out = await (ref as any)[take]({ qualityPrioritization: 'speed', skipMetadata: true, width: 640, base64: false });
                      const uri = out?.path || out?.uri || out?.localUri || out?.file || null;
                      if (uri) { const normalized = (typeof uri === 'string' && uri.startsWith('/')) ? ('file://' + uri) : uri; frozenImageUriRef.current = normalized; }
                    } catch (_e) { frozenImageUriRef.current = null; }
                  }
                } catch (_e) { frozenImageUriRef.current = null; }
              })();
              try {
                if (voiceEnabled && voiceMode !== 'disable' && liveDetected) {
                    try { freezeSpeakTimersRef.current.forEach((tid) => { try { clearTimeout(tid as any); } catch (_e) {} }); } catch (_e) {}
                    freezeSpeakTimersRef.current = [];
                    const textToSpeak = voiceMode === 'real' ? liveDetected.realName : liveDetected.family;
                    const tid = setTimeout(() => { try { const maybe = safeSpeak(textToSpeak, { force: true }); Promise.resolve(maybe).catch(() => {}); } catch (err) {} }, 600) as unknown as number;
                    try { freezeSpeakTimersRef.current.push(tid); } catch (_e) {}
                    setTimeout(() => { try { suppressSpeechRef.current = false; } catch (_e) {} }, 800);
                  } else if (voiceEnabled && voiceMode !== 'disable' && !liveDetected) {
                    (async () => { try { const c = await captureAndSampleCenter(); if (c) { setFrozenSnapshot(c);
                          try { freezeSpeakTimersRef.current.forEach((tid) => { try { clearTimeout(tid as any); } catch (_e) {} }); } catch (_e) {}
                          freezeSpeakTimersRef.current = [];
                          const textToSpeak = voiceMode === 'real' ? c.realName : c.family;
                          const tid2 = setTimeout(() => { try { const maybe2 = safeSpeak(textToSpeak, { force: true }); Promise.resolve(maybe2).catch(() => {}); } catch (err) {} }, 600) as unknown as number;
                          try { freezeSpeakTimersRef.current.push(tid2); } catch (_e) {}
                          setTimeout(() => { try { suppressSpeechRef.current = false; } catch (_e) {} }, 800);
                      } } catch (_e) {} })();
                  }
              } catch (_e) {}
            });
          }
        } catch (err) { setCrosshairPos(null); }
      }, 50);
    }
  };

  const onScreenPress = async (e: any) => {
    if (!freeze) return;
    try {
      const { relX, relY } = await mapPressToPreviewCoords(e, previewRef, previewLayout);
      try {
        const markerId = Date.now();
        setTapMarker({ x: Math.round(relX), y: Math.round(relY), id: markerId });
        try { setTimeout(() => { try { setTapMarker((cur) => cur && cur.id === markerId ? null : cur); } catch (_e) {} }, 5000); } catch (_e) {}
      } catch (_e) {}
      try {
        if (selectedImageUri && imageScaledSize && previewLayout.current) {
          let panX = 0, panY = 0; try { panX = (pan.x as any).__getValue ? (pan.x as any).__getValue() : 0; } catch (_e) { panX = 0; } try { panY = (pan.y as any).__getValue ? (pan.y as any).__getValue() : 0; } catch (_e) { panY = 0; }
          const pw = previewLayout.current.width || 0; const ph = previewLayout.current.height || 0;
          const imageLeft = Math.round((pw - imageScaledSize.w) / 2) + panX; const imageTop = Math.round((ph - imageScaledSize.h) / 2) + panY;
          if (relX < imageLeft || relY < imageTop || relX > imageLeft + imageScaledSize.w || relY > imageTop + imageScaledSize.h) return;
          try { setCrosshairPos({ x: relX, y: relY }); } catch (_e) {}
        } else { try { setCrosshairPos({ x: relX, y: relY }); } catch (_e) {} }
      } catch (_e) { try { setCrosshairPos({ x: relX, y: relY }); } catch (_e2) {} }
      let selectedSample: any = null;
      const trySampleUploadedImage = async () => { try { if (selectedImageUri) { const res = await sampleUploadedImageAt(relX, relY); if (res) return res; } } catch (_e) {} return null; };
      try {
        const uploadedRes = await trySampleUploadedImage();
        if (uploadedRes && (uploadedRes as any).offImage) return;
        if (uploadedRes) {
          selectedSample = uploadedRes;
          applyManualSelection(selectedSample, (uploadedRes as any)?.sourceRgb || null, { speak: true });
        }
        else {
          if (frozenImageUriRef.current) {
            try {
              const uri = frozenImageUriRef.current;
              try {
                const { decodeScaledRegion } = require('../../services/ImageDecoder');
                const nativeSample = await decodeScaledRegion(uri, relX, relY, previewLayout.current.width || 0, previewLayout.current.height || 0);
                if (nativeSample) {
                  const match = await findClosestColorAsync([nativeSample.r, nativeSample.g, nativeSample.b], 3).catch(() => null);
                  if (match) {
                    selectedSample = { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name, confidence: match.closest_match.confidence };
                    applyManualSelection(selectedSample, nativeSample, { speak: true });
                  }
                }
              } catch (_e) {
                try {
                  const RNFS = require('react-native-fs');
                  const base64 = await RNFS.readFile(uri.replace('file://',''), 'base64');
                  const sample = _decodeAt(base64, relX, relY, previewLayout.current.width || 0, previewLayout.current.height || 0);
                  if (sample) {
                    const match = await findClosestColorAsync([sample.r, sample.g, sample.b], 3).catch(() => null);
                    if (match) {
                      selectedSample = { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name, confidence: match.closest_match.confidence };
                      applyManualSelection(selectedSample, sample, { speak: true });
                    }
                  }
                } catch (_e2) {}
              }
            } catch (_e) {}
          }
          if (!selectedSample) {
            try {
              const res:any = await captureAndSampleAt(relX, relY);
              if (res) {
                selectedSample = res;
                applyManualSelection(res, res?.sourceRgb || null, { speak: true });
              } else {
                try {
                  const sampled = getFallbackColor();
                  const rgb = hexToRgb(sampled.hex);
                  const match = findClosestColor(rgb, 3);
                  const c = { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name, confidence: match.closest_match.confidence };
                  applyManualSelection(c, rgbArrayToObject(rgb), { speak: true });
                  selectedSample = c;
                } catch (err) {
                  const c = getFallbackColor();
                  applyManualSelection(c, null, { speak: true });
                  selectedSample = c;
                }
              }
            } catch (_err) {
              try {
                const sampled = getFallbackColor();
                const rgb = hexToRgb(sampled.hex);
                const match = findClosestColor(rgb, 3);
                const c = { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name, confidence: match.closest_match.confidence };
                applyManualSelection(c, rgbArrayToObject(rgb), { speak: true });
                selectedSample = c;
              } catch (err) {
                const c = getFallbackColor();
                applyManualSelection(c, null, { speak: true });
                selectedSample = c;
              }
            }
          }
        }
        if (selectedSample) try { setCrosshairPos({ x: relX, y: relY }); } catch (_e) {}
      } catch (_err) {
        try {
          const sampled = getFallbackColor();
          applyManualSelection(sampled, null, { speak: true });
        } catch (_e) {}
      }
    } catch (err) {}
  };

  const handleTapAt = async (relX: number, relY: number) => {
    try {
      let selectedSample: any = null;
      try {
        if (selectedImageUri && imageScaledSize && previewLayout.current) {
          let panX = 0, panY = 0; try { panX = (pan.x as any).__getValue ? (pan.x as any).__getValue() : 0; } catch (_e) { panX = 0; } try { panY = (pan.y as any).__getValue ? (pan.y as any).__getValue() : 0; } catch (_e) { panY = 0; }
          const pw = previewLayout.current.width || 0; const ph = previewLayout.current.height || 0;
          const imageLeft = Math.round((pw - imageScaledSize.w) / 2) + panX; const imageTop = Math.round((ph - imageScaledSize.h) / 2) + panY;
          if (relX < imageLeft || relY < imageTop || relX > imageLeft + imageScaledSize.w || relY > imageTop + imageScaledSize.h) return;
          try { setCrosshairPos({ x: relX, y: relY }); } catch (_e) {}
        } else { try { setCrosshairPos({ x: relX, y: relY }); } catch (_e) {} }
      } catch (_e) { try { setCrosshairPos({ x: relX, y: relY }); } catch (_e2) {} }
      const trySampleUploadedImage = async () => { try { if (selectedImageUri) { const res = await sampleUploadedImageAt(relX, relY); if (res) return res; } } catch (_e) {} return null; };
      try {
        const uploadedRes = await trySampleUploadedImage();
        if (uploadedRes && (uploadedRes as any).offImage) return;
        if (uploadedRes) {
          selectedSample = uploadedRes;
          applyManualSelection(selectedSample, (uploadedRes as any)?.sourceRgb || null, { speak: true });
        }
        else {
          if (frozenImageUriRef.current) {
            try {
              const uri = frozenImageUriRef.current;
              try {
                const { decodeScaledRegion } = require('../../services/ImageDecoder');
                const nativeSample = await decodeScaledRegion(uri, relX, relY, previewLayout.current.width || 0, previewLayout.current.height || 0);
                if (nativeSample) {
                  const match = await findClosestColorAsync([nativeSample.r, nativeSample.g, nativeSample.b], 3).catch(() => null);
                  if (match) {
                    selectedSample = { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name, confidence: match.closest_match.confidence };
                    applyManualSelection(selectedSample, nativeSample, { speak: true });
                  }
                }
              } catch (_e) {
                try {
                  const RNFS = require('react-native-fs');
                  const base64 = await RNFS.readFile(uri.replace('file://',''), 'base64');
                  const sample = _decodeAt(base64, relX, relY, previewLayout.current.width || 0, previewLayout.current.height || 0);
                  if (sample) {
                    const match = await findClosestColorAsync([sample.r, sample.g, sample.b], 3).catch(() => null);
                    if (match) {
                      selectedSample = { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name, confidence: match.closest_match.confidence };
                      applyManualSelection(selectedSample, sample, { speak: true });
                    }
                  }
                } catch (_e2) {}
              }
            } catch (_e) {}
          }
          if (!selectedSample) {
            try {
              const res:any = await captureAndSampleAt(relX, relY);
              if (res) {
                selectedSample = res;
                applyManualSelection(res, res?.sourceRgb || null, { speak: true });
              } else {
                try {
                  const sampled = getFallbackColor();
                  const rgb = hexToRgb(sampled.hex);
                  const match = findClosestColor(rgb, 3);
                  const c = { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name, confidence: match.closest_match.confidence };
                  applyManualSelection(c, rgbArrayToObject(rgb), { speak: true });
                  selectedSample = c;
                } catch (err) {
                  const c = getFallbackColor();
                  applyManualSelection(c, null, { speak: true });
                  selectedSample = c;
                }
              }
            } catch (_err) {
              try {
                const sampled = getFallbackColor();
                const rgb = hexToRgb(sampled.hex);
                const match = findClosestColor(rgb, 3);
                const c = { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name, confidence: match.closest_match.confidence };
                applyManualSelection(c, rgbArrayToObject(rgb), { speak: true });
                selectedSample = c;
              } catch (err) {
                const c = getFallbackColor();
                applyManualSelection(c, null, { speak: true });
                selectedSample = c;
              }
            }
          }
        }
        if (selectedSample) try { setCrosshairPos({ x: relX, y: relY }); } catch (_e) {}
      } catch (_err) {
        try {
          const sampled = getFallbackColor();
          applyManualSelection(sampled, null, { speak: true });
        } catch (_e) {}
      }
    } catch (err) {}
  };


  const forceExitApp = () => {
    try {
      if (RNExitApp && typeof RNExitApp.exitApp === 'function') {
        RNExitApp.exitApp();
        return;
      }
    } catch (_e) {}
    try { BackHandler.exitApp(); } catch (_e2) {}
    setTimeout(() => {
      try { BackHandler.exitApp(); } catch (_e3) {}
    }, 120);
    setTimeout(() => {
      try { BackHandler.exitApp(); } catch (_e4) {}
    }, 300);
  };

  const showPermissionReminderAlert = () => {
    exitAppPendingRef.current = true;
    Alert.alert(
      'Camera Permission Required',
      'ColorLens needs camera permission to enable live color detection.',
      [
        {
          text: 'OK',
          onPress: () => { forceExitApp(); },
        },
      ],
      { cancelable: false },
    );
  };

  const showPermissionBlockedAlert = () => {
    Alert.alert(
      'Camera Permission Disabled',
      'Camera access has been disabled for ColorLens. Please enable it from system settings and try again.',
      [
        { text: 'OK', style: 'default' },
      ],
      { cancelable: false },
    );
  };

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setCameraPermission('authorized');
          return;
        }
        if (granted === PermissionsAndroid.RESULTS.DENIED) {
          setCameraPermission('denied');
          showPermissionReminderAlert();
          return;
        }
        if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          setCameraPermission('blocked');
          showPermissionBlockedAlert();
          return;
        }
        setCameraPermission('denied');
        return;
      }
      if (!VisionCamera) return;
      const handleVisionResult = (res: any) => {
        if (res === 'authorized' || res === 'granted') { setCameraPermission('authorized'); return true; }
        if (res === 'denied') { setCameraPermission('denied'); showPermissionReminderAlert(); return true; }
        if (res === 'blocked' || res === 'restricted') { setCameraPermission('blocked'); showPermissionBlockedAlert(); return true; }
        return false;
      };
      if (VisionCamera.requestCameraPermission) {
        const res = await VisionCamera.requestCameraPermission();
        if (handleVisionResult(res)) return;
        setCameraPermission(res ?? 'denied');
        return;
      }
      if (VisionCamera.Camera && VisionCamera.Camera.requestCameraPermission) {
        const res = await VisionCamera.Camera.requestCameraPermission();
        if (handleVisionResult(res)) return;
        setCameraPermission(res ?? 'denied');
        return;
      }
      if (VisionCamera.requestPermissions) {
        const res = await VisionCamera.requestPermissions();
        const cam = res?.camera ?? 'denied';
        if (handleVisionResult(cam)) return;
        setCameraPermission(cam);
        return;
      }
    } catch (err) {}
  };

  const pickImage = async () => {
    try {
      try { suppressSpeechRef.current = true; } catch (_e) {}
      let ImagePicker: any = null;
      try { ImagePicker = require('react-native-image-picker'); } catch (err) { ImagePicker = null; }
      if (!ImagePicker) return;

      ImagePicker.launchImageLibrary({ mediaType: 'photo' }, async (response: any) => {
        try {
          if (!response) return;
          if (response.didCancel) return;
          const uri = (response.assets && response.assets[0] && response.assets[0].uri) || response.uri || null;
          if (!uri) return;
          try { Image.getSize(uri, (w, h) => { setImageNaturalSize({ w, h }); }, (_err) => {}); } catch (_err) {}
          setSelectedImageUri(uri);
          try { setFreeze(true); freezeRef.current = true; } catch (_e) {}
          frozenImageUriRef.current = null;

          const doProcessing = async () => {
            let selectedSample: any = null;
            try {
              try { await ensurePreviewMeasured(); } catch (_e) {}
              const centerX = (previewLayout.current.width || 0) / 2;
              const centerY = (previewLayout.current.height || 0) / 2;
              let res: any = null;
              try { res = await sampleUploadedImageAt(centerX, centerY); } catch (_e) { res = null; }
              if (res && !(res as any).offImage) {
                selectedSample = res;
                applyManualSelection(res, res?.sourceRgb || null, { speak: true });
                setFreeze(true);
              } else {
                if (uri && (uri as string).startsWith('file://')) {
                  try {
                    const RNFS = require('react-native-fs');
                    const base64 = await RNFS.readFile((uri as string).replace('file://',''), 'base64');
                    if (base64) {
                      const centerSample = _decodeCenter(base64);
                      if (centerSample) {
                        const match = await findClosestColorAsync([centerSample.r, centerSample.g, centerSample.b], 3).catch(() => null);
                        if (match) {
                          const c = { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name };
                          selectedSample = c;
                          applyManualSelection(c, centerSample, { speak: true });
                          setFreeze(true);
                        }
                      }
                    }
                  } catch (_e) {}
                }

                if (!selectedSample) {
                  clearManualSelection();
                  selectedSample = null;
                }
              }
            } catch (err) {
              clearManualSelection();
              selectedSample = null;
            }

          };
          try {
            await processWithIndicator(setProcessing, doProcessing);
          } catch (_e) {
            await doProcessing();
          }
        } catch (innerErr) {
        }
        try { setTimeout(() => { try { suppressSpeechRef.current = false; } catch (_e) {} }, 300); } catch (_e) {}
      });
    } catch (err) {
    }
  };
  useEffect(() => { panResponder.current = PanResponder.create({ onStartShouldSetPanResponder: () => adjusting, onMoveShouldSetPanResponder: () => adjusting, onPanResponderGrant: () => { try { pan.setOffset({ x: (pan.x as any).__getValue ? (pan.x as any).__getValue() : 0, y: (pan.y as any).__getValue ? (pan.y as any).__getValue() : 0 }); } catch (_e) {} pan.setValue({ x: 0, y: 0 }); }, onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }), onPanResponderRelease: () => { pan.flattenOffset(); clampPanToBounds(); }, onPanResponderTerminate: () => { pan.flattenOffset(); clampPanToBounds(); } }); }, [adjusting, imageScaledSize, previewSize]);
  useEffect(() => { if (!previewSize || !imageNaturalSize) return; const pw = previewSize.width; const ph = previewSize.height; const iw = imageNaturalSize.w; const ih = imageNaturalSize.h; const scale = Math.max(pw / iw, ph / ih); setImageScaledSize({ w: Math.round(iw * scale), h: Math.round(ih * scale) }); pan.setValue({ x: 0, y: 0 }); }, [previewSize, imageNaturalSize]);
  useEffect(() => {
    if (!previewSize) return;
    const center = { x: previewSize.width / 2, y: previewSize.height / 2 };
    if (!freeze) {
      setCrosshairPos(center);
    } else if (!crosshairPos) {
      setCrosshairPos(center);
    }
  }, [previewSize, freeze]);

  const clampPanToBounds = () => { if (!previewSize || !imageScaledSize) return; const maxOffsetX = Math.max(0, (imageScaledSize.w - previewSize.width) / 2); const maxOffsetY = Math.max(0, (imageScaledSize.h - previewSize.height) / 2); const curX = (pan.x as any).__getValue ? (pan.x as any).__getValue() : 0; const curY = (pan.y as any).__getValue ? (pan.y as any).__getValue() : 0; let clampedX = curX; let clampedY = curY; if (curX > maxOffsetX) clampedX = maxOffsetX; if (curX < -maxOffsetX) clampedX = -maxOffsetX; if (curY > maxOffsetY) clampedY = maxOffsetY; if (curY < -maxOffsetY) clampedY = -maxOffsetY; if (clampedX !== curX || clampedY !== curY) { Animated.spring(pan, { toValue: { x: clampedX, y: clampedY }, useNativeDriver: false }).start(); } };
  const onAdjustToggle = () => { setAdjusting((v) => { const next = !v; if (!next) setTimeout(() => clampPanToBounds(), 10); return next; }); };
  const captureAndSampleCenter = async (): Promise<any> => {
    const ready = await waitForCameraReady();
    if (!ready) {
      return null;
    }
    try {
      await ensurePreviewMeasured();
      const ref: any = cameraRef.current;
      if (ref && (ref.takeSnapshot || ref.takePhoto || ref.takePicture)) {
  const takeMethodName = ref.takeSnapshot ? 'takeSnapshot' : ref.takePhoto ? 'takePhoto' : 'takePicture';
        try {
          const photo = await ref[takeMethodName]({ qualityPrioritization: 'speed', skipMetadata: true, width: 640 });
          const uri = photo?.path || photo?.uri || photo?.localUri;
          const normalizedUri = (typeof uri === 'string' && uri.startsWith('/')) ? ('file://' + uri) : uri;
          if (normalizedUri && typeof normalizedUri === 'string' && normalizedUri.startsWith('file://')) {
            try {
              const { decodeScaledRegion } = require('../../services/ImageDecoder');
              const nativeSample = await decodeScaledRegion(normalizedUri, (previewLayout.current.width || 0) / 2, (previewLayout.current.height || 0) / 2, previewLayout.current.width || 0, previewLayout.current.height || 0);
                if (nativeSample) {
                const match = await findClosestColorAsync([nativeSample.r, nativeSample.g, nativeSample.b], 3).catch(() => null);
                if (match) return { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name, confidence: match.closest_match.confidence };
              }
            } catch (_e) {
              try {
                const RNFS = require('react-native-fs');
                    const base64 = await RNFS.readFile(normalizedUri.replace('file://',''), 'base64');
                    const sample = _decodeCenter(base64);
                if (sample) {
                  const match = await findClosestColorAsync([sample.r, sample.g, sample.b], 3).catch(() => null);
                  if (match) return { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name, confidence: match.closest_match.confidence };
                }
              } catch (_e2) {
              }
            }
          }
          if ((photo as any)?.base64) {
            const sample = _decodeCenter((photo as any).base64);
            if (sample) {
              const inferred = await inferColorFromRGB({ r: sample.r, g: sample.g, b: sample.b }).catch(() => null);
              if (inferred) return { family: inferred.family, hex: inferred.hex, realName: inferred.realName, confidence: inferred.confidence };
            }
          }
        } catch (err) {
        }
      }

      if (ref && (ref.takePictureAsync || ref.capture)) {
  const takePicMethod = ref.takePictureAsync ? 'takePictureAsync' : 'capture';
        try {
          const pic = await ref[takePicMethod]({ quality: 0.5, base64: true, width: 640, doNotSave: true });
            if (pic && pic.base64) {
            const sample = _decodeCenter(pic.base64);
            if (sample) {
              const match = await findClosestColorAsync([sample.r, sample.g, sample.b], 3).catch(() => null);
              if (match) return { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name, confidence: match.closest_match.confidence };
            }
          }
        } catch (err) {
        }
      }

      return null;
    } catch (e) {
      return null;
    }
  };

  const ensurePreviewMeasured = async (): Promise<void> => {
    try {
      const pw = previewLayout.current.width || 0;
      const ph = previewLayout.current.height || 0;
      if (pw > 0 && ph > 0) return;
      if (previewRef.current && previewRef.current.measureInWindow) {
        await new Promise<void>((resolve) => {
          try {
              previewRef.current.measureInWindow((px: number, py: number, pw2: number, ph2: number) => {
              previewLayout.current = { x: px, y: py, width: pw2, height: ph2 };
              resolve();
            });
          } catch (_e) { resolve(); }
        });
      }
    } catch (_e) {  }
  };

  const waitForCameraReady = async (timeoutMs = 3000, intervalMs = 120) => {
    const start = Date.now();
    try {
      if (!VisionCamera && !RNCamera) return false;
      while (Date.now() - start < timeoutMs) {
        try {
          const ref = cameraRef.current;
          const hasMethod = !!ref && (
            !!ref.takePhoto || !!ref.takeSnapshot || !!ref.takePicture || !!ref.takePictureAsync || !!ref.capture
          );
          const deviceAvailable = !!availableDevice || (!!availableDevices && availableDevices.length > 0) || !VisionCamera;
          if (hasMethod && deviceAvailable) {
            return true;
          }
        } catch (err) {
        }
        await new Promise((res) => setTimeout(() => res(undefined), intervalMs));
      }
    } catch (_err) {
    }
    return false;
  };

  

  const captureAndSampleAt = async (relX: number, relY: number): Promise<any> => {
    setCapturing(true);
    try {
      const ready = await waitForCameraReady();
      if (!ready) {
        setCapturing(false);
        return null;
      }
    } catch (_err) {
      setCapturing(false);
      return null;
    }

    try {
      await ensurePreviewMeasured();

      if (VisionCamera && cameraRef.current && (cameraRef.current.takePhoto || cameraRef.current.takeSnapshot || cameraRef.current.takePicture)) {
        const takeMethodName = cameraRef.current.takePhoto ? 'takePhoto' : cameraRef.current.takeSnapshot ? 'takeSnapshot' : 'takePicture';
        try {
          const photo = await (cameraRef.current as any)[takeMethodName]({ qualityPrioritization: 'speed', skipMetadata: true });
          const uri = photo?.path || photo?.uri || photo?.localUri;
          const normalizedUri = (typeof uri === 'string' && uri.startsWith('/')) ? ('file://' + uri) : uri;

          if (normalizedUri && typeof normalizedUri === 'string' && normalizedUri.startsWith('file://')) {
            try {
              const { decodeScaledRegion } = require('../../services/ImageDecoder');
              const nativeSample = await decodeScaledRegion(normalizedUri, relX, relY, previewLayout.current.width || 0, previewLayout.current.height || 0);
                if (nativeSample) {
                const match = await findClosestColorAsync([nativeSample.r, nativeSample.g, nativeSample.b], 3).catch(() => null);
                if (match) return { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name, confidence: match.closest_match.confidence };
              }
            } catch (_e) {
              try {
                const RNFS = require('react-native-fs');
                const base64 = await RNFS.readFile(normalizedUri.replace('file://',''), 'base64');
                const sample = _decodeAt(base64, relX, relY, previewLayout.current.width || 0, previewLayout.current.height || 0);
                if (sample) {
                  const inferred = await inferColorFromRGB({ r: sample.r, g: sample.g, b: sample.b }).catch(() => null);
                  if (inferred) return { family: inferred.family, hex: inferred.hex, realName: inferred.realName, confidence: inferred.confidence };
                }
              } catch (_e2) {
              }
            }
          }

          if ((photo as any)?.base64) {
            const sample = _decodeAt((photo as any).base64, relX, relY, previewLayout.current.width || 0, previewLayout.current.height || 0);
            if (sample) {
              const match = await findClosestColorAsync([sample.r, sample.g, sample.b], 3).catch(() => null);
              if (match) return { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name, confidence: match.closest_match.confidence };
            }
          }
        } catch (_err) {
        }
      }

      if (RNCamera && cameraRef.current && (cameraRef.current.takePictureAsync || cameraRef.current.capture)) {
        const takePicMethod = cameraRef.current.takePictureAsync ? 'takePictureAsync' : 'capture';
        try {
          const pic = await (cameraRef.current as any)[takePicMethod]({ quality: 0.5, base64: true, width: 640, doNotSave: true });
          if (pic && pic.base64) {
            const sample = _decodeAt(pic.base64, relX, relY, previewLayout.current.width || 0, previewLayout.current.height || 0);
            if (sample) {
              const match = await findClosestColorAsync([sample.r, sample.g, sample.b], 3).catch(() => null);
              if (match) return { family: match.closest_match.family || match.closest_match.name, hex: match.closest_match.hex, realName: match.closest_match.name, confidence: match.closest_match.confidence };
            }
          }
        } catch (_err) {
        }
      }
      try {
        const centerSample = await captureAndSampleCenter();
  if (centerSample) return centerSample;
      } catch (_e) {
      }
      return null;
    } catch (e) {
      try {
        const centerSample = await captureAndSampleCenter();
        if (centerSample) return centerSample;
      } catch (_e) {
      }
      return null;
    } finally {
      try { setCapturing(false); } catch (_e) {}
    }
  };
  const sampleUploadedImageAt = async (relX: number, relY: number): Promise<any> => {
    if (!selectedImageUri) return null;
    try {
      try {
      if (captureRef && previewRef.current) {
        const snapSample = await sampleFromPreviewSnapshot(relX, relY);
          if (snapSample) {
            const match = await findClosestColorAsync([snapSample.r, snapSample.g, snapSample.b], 3).catch(() => null);
            if (match) {
              const pw = previewLayout.current.width || 0;
              const ph = previewLayout.current.height || 0;
              const mappedPreviewX = relX;
              const mappedPreviewY = relY;
              
              return {
                family: match.closest_match.family || match.closest_match.name,
                hex: match.closest_match.hex,
                realName: match.closest_match.name,
                confidence: match.closest_match.confidence,
                sourceRgb: snapSample,
              };
            }
          }
        }
      } catch (e) {
      }
      let base64: string | null = null;
      const uri = selectedImageUri as string;

      if (uri.startsWith('data:') && uri.indexOf('base64,') !== -1) {
        base64 = uri.split('base64,')[1];
      }
      try {
        const { decodeScaledRegion } = require('../../services/ImageDecoder');
        if (uri.startsWith('file://') || uri.startsWith('content://')) {
          const nativeSample = await decodeScaledRegion(uri, relX, relY, previewLayout.current.width || 0, previewLayout.current.height || 0);
          if (nativeSample) {
            const match = await findClosestColorAsync([nativeSample.r, nativeSample.g, nativeSample.b], 3).catch(() => null);
            if (!match) return null;
            try {
              const pw = previewLayout.current.width || 0;
              const ph = previewLayout.current.height || 0;
              const scaled = imageScaledSize || { w: pw, h: ph };
              let panX = 0, panY = 0;
              try { panX = (pan.x as any).__getValue ? (pan.x as any).__getValue() : 0; } catch (_e) { panX = 0; }
              try { panY = (pan.y as any).__getValue ? (pan.y as any).__getValue() : 0; } catch (_e) { panY = 0; }
              const imageLeft = Math.round((pw - scaled.w) / 2) + panX;
              const imageTop = Math.round((ph - scaled.h) / 2) + panY;
              const mappedPreviewX = relX;
              const mappedPreviewY = relY;
            
            } catch (_e) { }
            return {
              family: match.closest_match.family || match.closest_match.name,
              hex: match.closest_match.hex,
              realName: match.closest_match.name,
              confidence: match.closest_match.confidence,
              sourceRgb: nativeSample,
            };
          }
        }
      } catch (_e) {
      }
      if (!base64 && (uri.startsWith('content://') || uri.startsWith('http://') || uri.startsWith('https://'))) {
        try {
          const resp = await fetch(uri);
          const ab = await (resp as any).arrayBuffer();
          if (ab) {
            const { BufferShim: _BufferShim } = getJpegUtils();
            if (typeof _BufferShim !== 'undefined' && _BufferShim && (_BufferShim as any).from) {
              base64 = (_BufferShim as any).from(new Uint8Array(ab)).toString('base64');
            }
          }
        } catch (_e) {
        }
      }
      if (!base64) return null;

      let decoded: any = null;
      const { jpegjs: _jpegjs, BufferShim: _BufferShim } = getJpegUtils();
      if (!_jpegjs || !_BufferShim) return null;
  const buffer = _BufferShim.from(base64, 'base64');
  let exifOrient = 1;
  try { exifOrient = getJpegOrientation(buffer); } catch (_e) { exifOrient = 1; }
  const dec = _jpegjs.decode(buffer, { useTArray: true });
      if (!dec || !dec.width || !dec.data) return null;
      decoded = dec;
      const w = decoded.width; const h = decoded.height; const data = decoded.data;

      const pw = previewLayout.current.width || 0;
      const ph = previewLayout.current.height || 0;
      if (!pw || !ph) {
  const centerSample = _decodeCenter(base64);
        if (!centerSample) return null;
        const match = await findClosestColorAsync([centerSample.r, centerSample.g, centerSample.b], 3).catch(() => null);
        if (!match) return null;
        return {
          family: match.closest_match.family || match.closest_match.name,
          hex: match.closest_match.hex,
          realName: match.closest_match.name,
          confidence: match.closest_match.confidence,
          sourceRgb: centerSample,
        };
      }
      const scaled = imageScaledSize;
  if (!scaled) {
        const ix = Math.max(0, Math.min(w - 1, Math.round((relX / pw) * w)));
        const iy = Math.max(0, Math.min(h - 1, Math.round((relY / ph) * h)));
        const half = 4;
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (let yy = Math.max(0, iy - half); yy <= Math.min(h - 1, iy + half); yy++) {
          for (let xx = Math.max(0, ix - half); xx <= Math.min(w - 1, ix + half); xx++) {
            const idx = (yy * w + xx) * 4;
            rSum += data[idx]; gSum += data[idx+1]; bSum += data[idx+2]; count++;
          }
        }
        if (count === 0) return null;
        const sampled = { r: Math.round(rSum/count), g: Math.round(gSum/count), b: Math.round(bSum/count) };
        const match = await findClosestColorAsync([sampled.r, sampled.g, sampled.b], 3).catch(() => null);
        if (!match) return null;
        return {
          family: match.closest_match.family || match.closest_match.name,
          hex: match.closest_match.hex,
          realName: match.closest_match.name,
          confidence: match.closest_match.confidence,
          sourceRgb: sampled,
        };
      }
      let panX = 0, panY = 0;
      try { panX = (pan.x as any).__getValue ? (pan.x as any).__getValue() : 0; } catch (_e) { panX = 0; }
      try { panY = (pan.y as any).__getValue ? (pan.y as any).__getValue() : 0; } catch (_e) { panY = 0; }

      const imageLeft = Math.round((pw - scaled.w) / 2) + panX;
      const imageTop = Math.round((ph - scaled.h) / 2) + panY;

      const localX = relX - imageLeft;
      const localY = relY - imageTop;

      if (localX < 0 || localY < 0 || localX > scaled.w || localY > scaled.h) {
        return { offImage: true } as any;
      }
      let ix = Math.max(0, Math.min(w - 1, Math.round((localX / scaled.w) * w)));
      let iy = Math.max(0, Math.min(h - 1, Math.round((localY / scaled.h) * h)));
      try {
        switch (exifOrient) {
          case 2:
            ix = w - 1 - ix; break;
          case 3:
            ix = w - 1 - ix; iy = h - 1 - iy; break;
          case 4:
            iy = h - 1 - iy; break;
          case 5: {
            const ox = ix; ix = iy; iy = ox; break;
          }
          case 6: {
            const ox = ix; ix = h - 1 - iy; iy = ox; break;
          }
          case 7: {
            const ox = ix; ix = h - 1 - iy; iy = w - 1 - ox; break;
          }
          case 8: {
            const ox = ix; ix = iy; iy = w - 1 - ox; break;
          }
          default: break;
        }
      } catch (_e) { }

      const half = 4;
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let yy = Math.max(0, iy - half); yy <= Math.min(h - 1, iy + half); yy++) {
        for (let xx = Math.max(0, ix - half); xx <= Math.min(w - 1, ix + half); xx++) {
          const idx = (yy * w + xx) * 4;
          rSum += data[idx]; gSum += data[idx+1]; bSum += data[idx+2]; count++;
        }
      }
      if (count === 0) return null;
  const sampled = { r: Math.round(rSum/count), g: Math.round(gSum/count), b: Math.round(bSum/count) };
  try {
    const mappedPreviewX = imageLeft + (ix / w) * scaled.w;
    const mappedPreviewY = imageTop + (iy / h) * scaled.h;
  
  } catch (_e) { }
  const match = await findClosestColorAsync([sampled.r, sampled.g, sampled.b], 3).catch(() => null);
  if (!match) return null;
  return {
    family: match.closest_match.family || match.closest_match.name,
    hex: match.closest_match.hex,
    realName: match.closest_match.name,
    confidence: match.closest_match.confidence,
    sourceRgb: sampled,
  };
    } catch (err) {
      return null;
    }
  };
  const onPreviewTap = (evt: any) => {
    if (selectedImageUri && !adjusting) {
      onScreenPress(evt);
      return;
    }
    onScreenPress(evt);
  };

    const centerX = previewSize ? (freeze && crosshairPos ? crosshairPos.x : previewSize.width / 2) : 0;
    const centerY = previewSize ? (freeze && crosshairPos ? crosshairPos.y : previewSize.height / 2) : 0;
    const lengthFactor = freeze ? CROSSHAIR_LENGTH_FACTOR_FROZEN : CROSSHAIR_LENGTH_FACTOR;
    const displayDetected = freeze ? (frozenSnapshot ?? detected) : liveDetected ?? detected;

  return (
    <View style={[styles.container, { paddingTop: insets.top || 0, paddingBottom: insets.bottom || 0 }]}> 
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backButton, (cameraPermission !== 'authorized' || freeze) && { opacity: 0.45 }]}
          hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
          disabled={cameraPermission !== 'authorized' || freeze}
        >
          <Image source={ICONS.ARROWicon} style={styles.backIconImage} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        <TouchableOpacity
          onPress={() => { openSettings(); }}
          style={[styles.settingsButton, (cameraPermission !== 'authorized' || freeze) && { opacity: 0.45 }]}
          hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
          disabled={cameraPermission !== 'authorized' || freeze}
        >
          <SettingsIcon size={rf(32)} color="#000" />
        </TouchableOpacity>
      </View>
      <TouchableWithoutFeedback onPress={onPreviewTap}>
        <View style={styles.cameraArea}>
          {!processing && (
          <View style={styles.previewWrapper} onStartShouldSetResponder={() => true} onResponderRelease={(e) => {
            try { if (!freeze) return; const mapped = mapLocalPressToPreviewCoords(e, previewLayout); handleTapAt(mapped.relX, mapped.relY); } catch (_e) {}
          }}>
           {selectedImageUri ? (
            <View ref={(el)=>{ previewRef.current = el; }} style={styles.cameraPreviewContainer} onLayout={async (e)=>{
                      try {
                        if (previewRef.current && previewRef.current.measureInWindow) {
                          try {
                            previewRef.current.measureInWindow((px:number, py:number, pw:number, ph:number) => {
                              previewLayout.current = { x: px, y: py, width: pw, height: ph };
                              setPreviewSize({ width: pw, height: ph });
                            });
                          } catch (_e) {
                            const { width: pw, height: ph } = e.nativeEvent.layout;
                            previewLayout.current.width = pw; previewLayout.current.height = ph; setPreviewSize({ width: pw, height: ph });
                          }
                        } else {
                          const { width: pw, height: ph } = e.nativeEvent.layout;
                          previewLayout.current.width = pw; previewLayout.current.height = ph; setPreviewSize({ width: pw, height: ph });
                        }
                      } catch (innerErr) {  }
            }}>
              
              
               {imageScaledSize && previewSize ? (
                 <Animated.View
                   {...(adjusting && panResponder.current ? panResponder.current.panHandlers : {})}
                   pointerEvents={adjusting ? 'auto' : 'none'}
                   style={[styles.animatedImageAbsolute, { left: Math.round((previewSize.width - imageScaledSize.w) / 2), top: Math.round((previewSize.height - imageScaledSize.h) / 2), width: Math.round(imageScaledSize.w), height: Math.round(imageScaledSize.h), transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
                   >
                   <Image source={{ uri: selectedImageUri }} style={[{ width: Math.round(imageScaledSize.w), height: Math.round(imageScaledSize.h) }, styles.selectedImage, { resizeMode: 'cover' }]} />
                 </Animated.View>
               ) : (
                 <Animated.View
                   {...(adjusting && panResponder.current ? panResponder.current.panHandlers : {})}
                   pointerEvents={adjusting ? 'auto' : 'none'}
                   style={[styles.animatedFull, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
                   >
                   <Image source={{ uri: selectedImageUri }} style={[styles.cameraInner, styles.selectedImage, { resizeMode: 'cover' }]} />
                 </Animated.View>
               )}

            </View>
           ) : RNCamera ? (
             <View ref={(el)=>{ previewRef.current = el; }} style={styles.cameraPreviewContainer} onLayout={async (e)=>{
                       try {
                         if (previewRef.current && previewRef.current.measureInWindow) {
                           try {
                             previewRef.current.measureInWindow((px:number, py:number, pw:number, ph:number) => {
                               previewLayout.current = { x: px, y: py, width: pw, height: ph };
                               setPreviewSize({ width: pw, height: ph });
                             });
                           } catch (_e) {
                             const { width: pw, height: ph } = e.nativeEvent.layout;
                             previewLayout.current.width = pw; previewLayout.current.height = ph; setPreviewSize({ width: pw, height: ph });
                           }
                         } else {
                           const { width: pw, height: ph } = e.nativeEvent.layout;
                           previewLayout.current.width = pw; previewLayout.current.height = ph; setPreviewSize({ width: pw, height: ph });
                         }
                       } catch (innerErr) {  }
             }}>
               <RNCamera
                 ref={cameraRef}
                 style={styles.cameraInner}
                 type={RNCamera.Constants.Type.back}
                 captureAudio={false}
                 ratio={'4:3'}
                 captureTarget={RNCamera.constants?.CaptureTarget?.disk || undefined}
               />
             </View>
           ) : VisionCamera ? (
             (() => {
               if (cameraPermission !== 'authorized') {
                 return (
                   <View style={[styles.cameraPreview, styles.cameraFallback]}>
                     <Text style={styles.cameraFallbackText}>Camera permission not granted</Text>
                     <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
                       <Text style={styles.permissionButtonText}>Grant Camera Permission</Text>
                     </TouchableOpacity>
                   </View>
                 );
               }

               const finalDevice = availableDevice;
                 if (finalDevice) {
                  try {
                    const CameraComp = VisionCamera.Camera;
                      return (
                      <View ref={(el)=>{ previewRef.current = el; }} style={styles.cameraPreviewContainer} onLayout={async (e)=>{
                         try {
                           if (previewRef.current && previewRef.current.measureInWindow) {
                             try {
                               previewRef.current.measureInWindow((px:number, py:number, pw:number, ph:number) => {
                                 previewLayout.current = { x: px, y: py, width: pw, height: ph };
                                 setPreviewSize({ width: pw, height: ph });
                               });
                             } catch (_e) {
                               const { width: pw, height: ph } = e.nativeEvent.layout;
                               previewLayout.current.width = pw; previewLayout.current.height = ph; setPreviewSize({ width: pw, height: ph });
                             }
                           } else {
                             const { width: pw, height: ph } = e.nativeEvent.layout;
                             previewLayout.current.width = pw; previewLayout.current.height = ph; setPreviewSize({ width: pw, height: ph });
                           }
                         } catch (innerErr) {  }
                       }}>
                           <CameraComp
                           ref={cameraRef}
                           style={styles.cameraInner}
                           device={finalDevice}
                           isActive={!freeze || capturing}
                           onError={(err: any) => {
                             console.error('VisionCamera onError:', err);
                             const message = err?.message || err?.code || 'Camera error';
                             setCameraError(message);
                           }}
                           photo={true}
                           {...(frameProcessor ? { frameProcessor, frameProcessorFps: 2 } : {})}
                         />
                       </View>
                     );
                   } catch (innerErr) {
                   }
               }

               return (
                 <View style={[styles.cameraPreview, styles.cameraFallback]}>
                   <Text style={styles.cameraFallbackText}>No camera device detected.
                     On an emulator, enable a virtual camera (AVD settings) or run on a physical device.
                   </Text>
                  
                 </View>
               );
             })()
           ) : (
             <View style={[styles.cameraPreview, styles.cameraFallback]}>
               <Text style={styles.cameraFallbackText}>Camera not available</Text>
             </View>
           )}

    
   
  <View pointerEvents="box-none" style={[styles.absoluteOverlay, { width: previewSize?.width ?? '100%', height: previewSize?.height ?? '100%' }]}> 
               {tapMarker && previewSize && (
                 <View style={styles.tapMarkerRoot} pointerEvents="none">
                   <View style={[styles.tapMarkerDot, { left: Math.round(tapMarker.x - (18/2)), top: Math.round(tapMarker.y - (18/2)) }]} />
                 </View>
               )}

              {/* Show crosshair only when frozen or image is uploaded */}
              {crosshairPos && (freeze || selectedImageUri) && (
                 <View
                   pointerEvents="none"
                   style={[
                     styles.crosshairContainer,
                     { width: CROSSHAIR_CONTAINER_SIZE, height: CROSSHAIR_CONTAINER_SIZE, left: crosshairPos.x - Math.round(CROSSHAIR_CONTAINER_SIZE / 2), top: crosshairPos.y - Math.round(CROSSHAIR_CONTAINER_SIZE / 2) },
                   ]}
                 >
                   <View style={[styles.crosshairInner, { width: CROSSHAIR_CONTAINER_SIZE, height: CROSSHAIR_CONTAINER_SIZE }]}>
                     <View style={[{ width: CROSSHAIR_DOT_SIZE, height: CROSSHAIR_DOT_SIZE, borderRadius: Math.round(CROSSHAIR_DOT_SIZE/2) }, styles.crosshairDotBase]} />
                     <View style={[styles.crosshairLineBase, { width: 2, height: CROSSHAIR_CONTAINER_SIZE * 2 }]} />
                     <View style={[styles.crosshairLineBase, { height: 2, width: CROSSHAIR_CONTAINER_SIZE * 2 }]} />
                   </View>
                 </View>
               )}
              {/* Show green sampling box only in live detection (not frozen, no uploaded image) */}
              {debugSamplingBox && !freeze && !selectedImageUri && (
                <View
                  pointerEvents="none"
                  style={[
                    styles.debugSamplingBox,
                    {
                      left: debugSamplingBox.x,
                      top: debugSamplingBox.y,
                      width: debugSamplingBox.width,
                      height: debugSamplingBox.height,
                    },
                  ]}
                />
              )}
              {/* Show green dot at exact detection point */}
              {detectionDot && !freeze && !selectedImageUri && (
                <View
                  pointerEvents="none"
                  style={[
                    styles.detectionDot,
                    {
                      left: detectionDot.x - 8,
                      top: detectionDot.y - 8,
                    },
                  ]}
                />
              )}
              
              {/* Two-box white balance system */}
              {!freeze && !selectedImageUri && previewSize && (
                <View style={styles.twoBoxContainer}>
                  {(() => {
                    const boxSizePixels = referenceBoxSizeInches * PIXELS_PER_INCH;
                    const leftBoxX = previewSize.width * 0.25 - boxSizePixels / 2;
                    const leftBoxY = previewSize.height * 0.5 - boxSizePixels / 2;
                    const rightBoxX = previewSize.width * 0.75 - boxSizePixels / 2;
                    const rightBoxY = previewSize.height * 0.5 - boxSizePixels / 2;
                    
                    return (
                      <>
                        {/* Left box (rendered only when white balance is enabled) */}
                        {leftBoxEnabled && (
                          <View style={[
                            styles.whiteBalanceBox,
                            {
                              left: leftBoxX,
                              top: leftBoxY,
                              width: boxSizePixels,
                              height: boxSizePixels,
                            }
                          ]}>
                            <Text style={styles.whiteBalanceBoxLabel}>Place white paper here</Text>
                          </View>
                        )}
                        
                        {/* Right box */}
                        <View style={[
                          styles.whiteBalanceBox,
                          {
                            left: rightBoxX,
                            top: rightBoxY,
                            width: boxSizePixels,
                            height: boxSizePixels,
                          }
                        ]}>
                          <Text style={styles.whiteBalanceBoxLabel}>Put color to measure here</Text>
                        </View>
                      </>
                    );
                  })()}
                </View>
              )}
              
              {/* White balance warning */}
              {!freeze && !selectedImageUri && leftBoxEnabled && whiteBalanceStatus.status !== 'ok' && (
                <View style={styles.whiteBalanceWarning}>
                  <Text style={styles.whiteBalanceWarningText}>{whiteBalanceStatus.message}</Text>
                </View>
              )}
              {cameraError && (
                <TouchableOpacity style={styles.cameraErrorBanner} activeOpacity={0.8} onPress={() => setCameraError(null)}>
                  <Text style={styles.cameraErrorText}>{cameraError}</Text>
                </TouchableOpacity>
              )}
              
              {/* Toggle for left box */}
              {!freeze && !selectedImageUri && cameraPermission === 'authorized' && (
                <TouchableOpacity 
                  style={[
                    styles.whiteBalanceToggle,
                    leftBoxEnabled ? styles.whiteBalanceToggleActive : styles.whiteBalanceToggleInactive,
                  ]}
                  onPress={() => setLeftBoxEnabled(!leftBoxEnabled)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.whiteBalanceToggleIcon}>{leftBoxEnabled ? '✕' : '✓'}</Text>
                  <Text style={styles.whiteBalanceToggleText}>
                    {leftBoxEnabled ? 'Disable White Balance' : 'Enable White Balance'}
                  </Text>
                </TouchableOpacity>
              )}
    </View>
              {!freeze && (
              <Text style={styles.crosshairHint}>Aim the right box to the color you want to detect.</Text>
            )}
          </View>
          )}
        </View>
      </TouchableWithoutFeedback>
      
      {selectedImageUri && (
        <View style={styles.adjustArea} pointerEvents="box-none">
          <TouchableOpacity style={styles.adjustButton} onPress={onAdjustToggle} activeOpacity={0.85}>
            <View style={styles.adjustButtonContent}>
              <Image source={ICONS.HANDicon} style={styles.adjustIcon} />
              <Text style={styles.adjustText}>{adjusting ? 'Done' : 'Adjust Image'}</Text>
            </View>
          </TouchableOpacity>
          {adjusting && (
            <View style={styles.adjustHelp}>
              <Text style={styles.adjustHelpText}>Drag the image to position it so the area you want to sample is visible under the crosshair. Tap done when finished.</Text>
            </View>
          )}
        </View>
      )}

        {processing && (
          <View style={styles.processingOverlay} pointerEvents="auto">
            <View style={styles.processingBox}>
              <ActivityIndicator size="large" color="#6A0DAF" />
              <Text style={styles.processingText}>Processing image…</Text>
            </View>
          </View>
        )}

        <View style={styles.infoArea}>
          {/* Comparison UI removed (debugging only) */}
          
          <View style={styles.colorInfoContainer}>
            {/* Color swatch on top */}
            <View style={styles.colorSwatchContainer}>
              <View style={[styles.colorSwatch, { backgroundColor: displayDetected?.hex || '#090807' }]} />
            </View>
            
            {/* Text info below swatch */}
            <View style={styles.colorInfoText}>
              {showFamily && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Family of:</Text>
                  <Text style={styles.infoValue}>{displayDetected?.family ?? '—'}</Text>
                </View>
              )}
              {colorCodesVisible && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Hex:</Text>
                  <Text style={styles.infoValue}>{displayDetected?.hex ?? '—'}</Text>
                </View>
              )}
              {showRealName && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Real Name:</Text>
                  <Text style={styles.infoValue}>{displayDetected?.realName ?? '—'}</Text>
                </View>
              )}
              {typeof displayDetected?.confidence === 'number' && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Confidence:</Text>
                  <Text style={styles.infoValue}>{`${Math.round(displayDetected!.confidence)}% Match`}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.uploadButton, (cameraPermission !== 'authorized' || freeze) && { opacity: 0.45 }]}
            onPress={pickImage}
            activeOpacity={0.8}
            disabled={cameraPermission !== 'authorized' || freeze}
          >
            <View style={styles.uploadButtonContent}>
              <Image source={ICONS.UploadIcon} style={styles.uploadIcon} />
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[freeze ? styles.unfreezeButton : styles.freezeButton, cameraPermission !== 'authorized' && { opacity: 0.45 }]}
            onPress={toggleFreeze}
            activeOpacity={0.8}
            disabled={cameraPermission !== 'authorized'}
          >
            <Text style={styles.freezeButtonText}>{freeze ? 'Unfreeze' : 'Freeze Frame'}</Text>
          </TouchableOpacity>
        </View>
    </View>
  );
};
export default ColorDetector;
