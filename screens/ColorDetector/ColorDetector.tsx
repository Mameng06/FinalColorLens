import React, { useEffect, useRef, useState } from 'react';
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
import { styles, rf } from './ColorDetector.styles';
import { getFallbackColor, getJpegUtils, getJpegOrientation, decodeJpegAndSampleCenter as _decodeCenter, decodeJpegAndSampleAt as _decodeAt, hexToRgb, rgbToHex, processWithIndicator, mapPressToPreviewCoords, mapLocalPressToPreviewCoords, medianRgb } from './ColorDetectorLogic';
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
  const freezeSpeakTimersRef = useRef<number[]>([]);
  const lastSpokenRef = useRef<number>(0);
  const LIVE_SPEAK_COOLDOWN = 1200;
  const [cameraPermission, setCameraPermission] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<any[] | null>(null);
  const availableDevice = availableDevices ? availableDevices.find((d:any) => d.position === 'back') ?? availableDevices[0] : null;
  const permissionInitializedRef = useRef(false);
  const exitAppPendingRef = useRef(false);

  // Calibration: gains are stored in ColorDetectorLogic; use getCalibratedGains()
  const [cameraExposureLocked, setCameraExposureLocked] = useState<boolean>(false);

  const processingFrameRef = useRef(false);

  // Debug overlay state
  const [debugGains, setDebugGains] = useState<{gr:number;gg:number;gb:number}|null>(null);
  const [debugCorrectedRight, setDebugCorrectedRight] = useState<{r:number;g:number;b:number}|null>(null);
  const [debugRightRaw, setDebugRightRaw] = useState<{r:number;g:number;b:number}|null>(null);
  const [debugRightMatch, setDebugRightMatch] = useState<string | null>(null);

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

  const rgbDist = (a: {r:number;g:number;b:number}, b: {r:number;g:number;b:number}) => {
    const dr = a.r - b.r; const dg = a.g - b.g; const db = a.b - b.b;
    return Math.sqrt(dr*dr + dg*dg + db*db);
  };

  const temporalMedianPush = (c: {r:number;g:number;b:number}, size = 5): {r:number;g:number;b:number} => {
    try {
      const arr = rollingRightColorsRef.current || [];
      arr.push(c);
      while (arr.length > size) arr.shift();
      rollingRightColorsRef.current = arr;
      const med = medianRgb(arr);
      return med || c;
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


  const safeSpeak = (text: string, opts?: { force?: boolean }) => {
    try { if (suppressSpeechRef.current && !(opts && opts.force)) return false; } catch (_e) {}
    try {
      const res = speak(text);
      return res;
    } catch (err) {
      return false;
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


  useEffect(() => { 
    try { initTts(); } catch (_e) {} 
    lockCameraExposure();
  }, []);
  useEffect(() => { exitAppPendingRef.current = false; }, []);

  const processSnapshotAndSample = async (): Promise<boolean> => {
    try {
      if (cameraPermission !== 'authorized') return false;
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
      let base64: string | null = null;
      // clear previous per-pass debug entries
      try { setDebugRightRaw(null); setDebugRightMatch(null); } catch (_e) {}
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
              
              // Sample from center box position
              const centerBoxRelX = pw * 0.5; // Center box is at 50% from left
              const centerBoxRelY = ph * 0.6; // Center box is at 60% from top (slightly below center)
              console.log(`[ColorDetector Native] Attempting native decode grid around center (${centerBoxRelX.toFixed(0)}, ${centerBoxRelY.toFixed(0)})`);
              const gridRadius = Math.max(2, Math.floor(Math.min(pw, ph) * 0.03));
              const steps = 2; // 5x5 grid
              const nativeCenterSamples: Array<{r:number;g:number;b:number}> = [];
              for (let gy = -steps; gy <= steps; gy++) {
                for (let gx = -steps; gx <= steps; gx++) {
                  const sx = centerBoxRelX + (gx * gridRadius);
                  const sy = centerBoxRelY + (gy * gridRadius);
                  // eslint-disable-next-line no-await-in-loop
                  const s = await decodeScaledRegion(normalizedUri, sx, sy, pw, ph);
                  if (s && typeof s.r === 'number') nativeCenterSamples.push(s);
                }
              }
              const filtered = filterOutliersAroundMedian(nativeCenterSamples, 35);
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
                      const cx = Math.floor((centerBoxRelX / pw) * w);
                      const cy = Math.floor((centerBoxRelY / ph) * h);
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
                const sampleForInference = temporalMedianPush(centerSample, 7);
                try { setDebugCorrectedRight(sampleForInference); } catch (_e) {}
                console.log(`[ColorDetector Native] About to infer color`);
                const inferred = await inferColorFromRGB({ r: sampleForInference.r, g: sampleForInference.g, b: sampleForInference.b }).catch((e) => {
                  console.log(`[ColorDetector Native] Inference error:`, e);
                  return null;
                });
                console.log(`[ColorDetector Native] Inferred:`, inferred ? inferred.realName : 'null');
                if (inferred) {
                  const live = { family: inferred.family, hex: inferred.hex, realName: inferred.realName, confidence: inferred.confidence };
                  try { setDebugRightMatch(inferred.realName || inferred.family || inferred.hex || null); } catch (_e) {}
                  if (!freeze) setLiveDetected(live);
                  processingFrameRef.current = false;
                  return true;
                }
                // Fallback: try matcher-based nearest color
                try {
                  const match = await findClosestColorAsync([sampleForInference.r, sampleForInference.g, sampleForInference.b], 3).catch(() => null);
                  console.log(`[ColorDetector Native] Matcher fallback:`, match ? match.closest_match : null);
                  if (match && match.closest_match) {
                    const cm = match.closest_match;
                    const live = { family: cm.family || cm.name, hex: cm.hex, realName: cm.name, confidence: cm.confidence };
                    try { setDebugRightMatch(cm.name || cm.family || cm.hex || null); } catch (_e) {}
                    if (!freeze) setLiveDetected(live);
                    processingFrameRef.current = false;
                    return true;
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
        
        // Sample from center box area
        const cx = Math.floor(w * 0.5);
        const cy = Math.floor(h * 0.6);
        const cRadius = Math.floor(Math.min(w, h) * 0.06);
        const centerSamples: Array<{r:number;g:number;b:number}> = [];
        for (let yy = Math.max(0, cy - cRadius); yy <= Math.min(h-1, cy + cRadius); yy++) {
          for (let xx = Math.max(0, cx - cRadius); xx <= Math.min(w-1, cx + cRadius); xx++) {
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
            try { setDebugCorrectedRight(centerSampled); } catch (_e) {}
            console.log(`[ColorDetector] About to infer color from: ${centerSampled.r},${centerSampled.g},${centerSampled.b}`);
            const inferred = await inferColorFromRGB({ r: centerSampled.r, g: centerSampled.g, b: centerSampled.b }).catch((e) => {
              console.log(`[ColorDetector] Inference error:`, e);
              return null;
            });
            console.log(`[ColorDetector] Inferred result:`, inferred ? inferred.realName : 'null');
            if (inferred) {
              const live = { family: inferred.family, hex: inferred.hex, realName: inferred.realName, confidence: inferred.confidence };
              if (!freeze) setLiveDetected(live);
              processingFrameRef.current = false;
              return true;
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

  useEffect(() => {
    if (!liveDetected || !voiceEnabled || freeze) return;
    if (voiceMode === 'disable') return;
    try {
      const now = Date.now();
      if (now - lastSpokenRef.current < LIVE_SPEAK_COOLDOWN) return;
      const textToSpeak = voiceMode === 'real' ? liveDetected.realName : liveDetected.family;
      const ok = safeSpeak(textToSpeak);
      lastSpokenRef.current = now;
    } catch (err) {}
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
            debounceClearRef.current = setTimeout(() => { try { setLiveDetected(null); } catch (_e) {} debounceClearRef.current = null; }, 1600) as unknown as number;
          } catch (_e) { setLiveDetected(null); }
        }).catch(() => {
          setLiveDetected(null);
        });
      }
    }, 800);
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
              setFrozenSnapshot(liveDetected);
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
        <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}>
          <Image source={ICONS.ARROWicon} style={styles.backIconImage} />
        </TouchableOpacity>
  <TouchableOpacity onPress={() => { openSettings(); }} style={styles.settingsButton}><Text style={styles.settingsText}>⚙️</Text></TouchableOpacity>
        
      </View>
      <TouchableWithoutFeedback onPress={onPreviewTap}>
        <View style={styles.cameraArea}>
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

    
   
  <View pointerEvents="none" style={[styles.absoluteOverlay, { width: previewSize?.width ?? '100%', height: previewSize?.height ?? '100%' }]}> 
               {tapMarker && previewSize && (
                 <View style={styles.tapMarkerRoot} pointerEvents="none">
                   <View style={[styles.tapMarkerDot, { left: Math.round(tapMarker.x - (18/2)), top: Math.round(tapMarker.y - (18/2)) }]} />
                 </View>
               )}

              {crosshairPos && (
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
    </View>
            {!freeze && (
              <Text style={styles.crosshairHint}>Aim the crosshair at the color you want to detect.</Text>
            )}
          </View>
          
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
        </View>
      </TouchableWithoutFeedback>

        {processing && (
          <View style={styles.processingOverlay} pointerEvents="box-none">
            <View style={styles.processingBox}>
              <ActivityIndicator size="large" color="#6A0DAF" />
              <Text style={styles.processingText}>Processing image…</Text>
            </View>
          </View>
        )}

        <View style={styles.infoArea}>

          {/* Replaced big swatch with always-visible dual swatches for debugging
              - Left: Actual detected color (camera sample) with RGB + hex
              - Right: Matched color from dataset (displayDetected)
              Shows placeholders when actual sample isn't available. */}
          <View style={{ marginBottom: 12, paddingHorizontal: 16 }}>
            <Text style={{ color: '#666', fontSize: 12, marginBottom: 6, fontWeight: '600' }}>Actual Detected vs Matched:</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              {/* Actual detected RGB swatch */}
              <View style={{ alignItems: 'center', marginRight: 10 }}>
                <View style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: 8, 
                  backgroundColor: debugRightRaw ? rgbToHex(debugRightRaw.r, debugRightRaw.g, debugRightRaw.b) : '#777777',
                  borderWidth: 2,
                  borderColor: '#ccc',
                  marginBottom: 4
                }} />
                <Text style={{ fontSize: 11, color: '#333', fontWeight: '600' }}>Detected</Text>
                <Text style={{ fontSize: 10, color: '#666' }}>{debugRightRaw ? rgbToHex(debugRightRaw.r, debugRightRaw.g, debugRightRaw.b) : '—'}</Text>
                <Text style={{ fontSize: 9, color: '#999' }}>{debugRightRaw ? `RGB: ${debugRightRaw.r}, ${debugRightRaw.g}, ${debugRightRaw.b}` : 'Waiting...'}</Text>
              </View>

              {/* Matched color swatch */}
              <View style={{ alignItems: 'center', marginLeft: 10 }}>
                <View style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: 8, 
                  backgroundColor: displayDetected?.hex || '#000000',
                  borderWidth: 2,
                  borderColor: '#FFD700',
                  marginBottom: 4
                }} />
                <Text style={{ fontSize: 11, color: '#333', fontWeight: '600' }}>Matched</Text>
                <Text style={{ fontSize: 10, color: '#666' }}>{displayDetected?.hex || '—'}</Text>
                <Text style={{ fontSize: 9, color: '#999' }}>{displayDetected?.realName || '—'}</Text>
              </View>
            </View>
          </View>

        <View style={{ alignSelf: 'center', width: '100%', maxWidth: rf(280), paddingHorizontal: rf(20), paddingVertical: rf(12) }}>
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
              <Text style={styles.infoValue}>{`${Math.round(displayDetected!.confidence)}% match`}</Text>
            </View>
          )}
        </View>
        <View style={styles.uploadRow}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage} activeOpacity={0.8}>
            <View style={styles.uploadButtonContent}>
              <Image source={ICONS.UploadIcon} style={styles.uploadIcon} />
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </View>
          </TouchableOpacity>
          {selectedImageUri && (
            <Image source={{ uri: selectedImageUri }} style={styles.thumbnail} />
          )}
        </View>
        <TouchableOpacity style={[styles.freezeButton, freeze && styles.unfreezeButton]} onPress={toggleFreeze} activeOpacity={0.8}>
          <Text style={styles.freezeButtonText}>{freeze ? 'Unfreeze' : 'Freeze Frame'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default ColorDetector;
