import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
const SCALE = Math.max(0.9, Math.min(width / 375, 1.18));
export const rf = (n: number) => Math.round(n * SCALE);

export const REFERENCE_BOX_DEFAULT_SIZE = 0.4; // inches
export const REFERENCE_BOX_MIN_SIZE = 0.1; // inches
export const REFERENCE_BOX_MAX_SIZE = 0.4; // inches
export const PIXELS_PER_INCH = 96; // Standard DPI

export const CROSSHAIR_LENGTH_FACTOR = 0.5;
export const CROSSHAIR_LENGTH_FACTOR_FROZEN = 0.35;
export const CROSSHAIR_THICKNESS = 2;
export const CROSSHAIR_DOT_SIZE = 10;
export const CROSSHAIR_DOT_BORDER = 2;
export const CROSSHAIR_CONTAINER_SIZE = CROSSHAIR_DOT_SIZE + CROSSHAIR_DOT_BORDER * 2;

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F0', position: 'relative' },
  header: { flexDirection: 'row', alignItems: 'center', padding: rf(14) },
  headerSpacer: { flex: 1 },
  backButton: { width: rf(48), height: rf(48), borderRadius: rf(24), justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  backText: { fontSize: rf(20), fontWeight: '700', color: '#fff' },
  settingsButton: { paddingVertical: rf(8), paddingHorizontal: rf(8), borderRadius: 6, minWidth: rf(44), minHeight: rf(44), justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  settingsText: { fontSize: rf(20) },
  cameraArea: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#F5F5F0', position: 'relative', paddingTop: rf(8), paddingHorizontal: rf(12), paddingBottom: rf(8), minHeight: rf(300) },
  cameraPreview: { width: '100%', maxWidth: width - 32, alignSelf: 'center', aspectRatio: 4 / 3, borderRadius: 8, overflow: 'hidden', backgroundColor: '#000', position: 'relative' },
  cameraFallback: { backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: width - 32, aspectRatio: 4 / 3, borderRadius: 8 },
  cameraFallbackText: { color: '#666', fontSize: rf(15) },
  permissionButton: { marginTop: rf(12), backgroundColor: '#2B7FFF', paddingVertical: rf(12), paddingHorizontal: rf(16), borderRadius: 10 },
  permissionButtonText: { color: '#fff', fontWeight: '700', fontSize: rf(15) },
  crosshairVertical: { position: 'absolute', width: 2, backgroundColor: '#fff', borderRadius: 0, elevation: 4 },
  crosshairHorizontal: { position: 'absolute', height: 2, backgroundColor: '#fff', borderRadius: 0, elevation: 4 },
  animatedImageAbsolute: { position: 'absolute' },
  animatedFull: { width: '100%', height: '100%' },
  selectedImage: { resizeMode: 'cover' },
  crosshairInner: { alignItems: 'center', justifyContent: 'center' },
  crosshairDotBase: { backgroundColor: 'rgba(255,0,0,0.95)' },
  crosshairLineBase: { position: 'absolute', backgroundColor: 'white' },
  crosshairHint: { textAlign: 'center', color: '#000000', marginTop: rf(8), fontSize: rf(13), fontWeight: '600' },
  cameraPreviewContainer: { width: '100%', maxWidth: width - 32, alignSelf: 'center', aspectRatio: 4 / 3, borderRadius: 8, overflow: 'hidden', backgroundColor: '#000', position: 'relative' },
  cameraInner: { width: '100%', height: '100%' },
  previewWrapper: { width: '100%', alignItems: 'center', position: 'relative' },
  debugText: { fontSize: 12, color: '#444' },
  debugBlock: { marginTop: 8 },
  absoluteOverlay: { position: 'absolute', left: 0, top: 0 },
  fillerBar: { position: 'absolute', backgroundColor: '#fff' },
  crosshairContainer: { position: 'absolute', justifyContent: 'center', alignItems: 'center', left: 0, top: 0 },
  crosshairDot: { width: CROSSHAIR_DOT_SIZE, height: CROSSHAIR_DOT_SIZE, borderRadius: Math.round(CROSSHAIR_DOT_SIZE/2), backgroundColor: 'rgba(255,0,0,0.95)', borderWidth: 0, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  infoArea: { paddingHorizontal: rf(20), paddingTop: rf(16), paddingBottom: 0, backgroundColor: '#F5F5F0', minHeight: rf(100) },
  colorInfoContainer: { flexDirection: 'column', alignItems: 'flex-start', marginBottom: 0, width: '100%' },
  colorSwatchContainer: { marginBottom: rf(12), alignItems: 'flex-start', justifyContent: 'center', width: '100%' },
  colorSwatch: { width: rf(70), height: rf(70), borderRadius: rf(6), borderWidth: 0 },
  colorInfoText: { width: '100%', justifyContent: 'flex-start', minHeight: rf(80) },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 0, width: '100%', flexWrap: 'nowrap' },
  infoLabel: { fontSize: rf(12), color: '#000', fontWeight: '600', marginRight: rf(6) },
  infoValue: { fontSize: rf(18), fontWeight: '700', color: '#000', flexShrink: 1 },
  actionButtonsContainer: { flexDirection: 'column', paddingHorizontal: rf(20), paddingBottom: rf(20), backgroundColor: '#F5F5F0' },
  freezeButton: { width: '100%', backgroundColor: '#FF8C2B', paddingVertical: rf(14), paddingHorizontal: rf(18), borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: rf(10) },
  unfreezeButton: { width: '100%', backgroundColor: '#2B7FFF', paddingVertical: rf(14), paddingHorizontal: rf(18), borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: rf(12) },
  freezeButtonText: { color: '#fff', fontWeight: '700', fontSize: rf(16) },
  backIconImage: { width: rf(20), height: rf(20), tintColor: '#fff', resizeMode: 'contain' },
  uploadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: rf(12) },
  uploadButton: { width: '50%', backgroundColor: '#6A0DAF', paddingVertical: rf(14), paddingHorizontal: rf(14), borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 0 },
  uploadButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  uploadIcon: { width: rf(20), height: rf(20), marginRight: rf(8), tintColor: '#fff', resizeMode: 'contain' },
  uploadButtonText: { color: '#fff', fontWeight: '700', fontSize: rf(16) },
  thumbnail: { width: rf(72), height: rf(72), borderRadius: 10, marginLeft: rf(12), borderWidth: 1, borderColor: '#EEE' },
  adjustArea: { position: 'absolute', top: rf(350), right: rf(8), alignItems: 'flex-end', zIndex: 10000000, elevation: 100, pointerEvents: 'box-none' },
  adjustButton: { backgroundColor: '#fff', paddingVertical: rf(10), paddingHorizontal: rf(12), borderRadius: rf(26), elevation: 101, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, zIndex: 10000001 },
  adjustButtonContent: { flexDirection: 'row', alignItems: 'center' },
  adjustIcon: { width: rf(20), height: rf(20), marginRight: rf(8), tintColor: '#6A0DAF', resizeMode: 'contain' },
  adjustText: { color: '#6A0DAF', fontWeight: '700', fontSize: rf(15) },
  adjustHelp: { marginTop: rf(8), paddingHorizontal: rf(12), backgroundColor: '#FF8C2B', paddingVertical: rf(10), borderRadius: 8, alignSelf: 'stretch', zIndex: 10000001, elevation: 101, position: 'relative' },
  adjustHelpText: { color: '#fff', fontSize: rf(14), textAlign: 'left', fontWeight: '600' },
  swatchContainer: { position: 'absolute', right: rf(12), top: rf(12), backgroundColor: 'rgba(255,255,255,0.97)', padding: rf(8), borderRadius: rf(8), flexDirection: 'row', alignItems: 'center', elevation: 10, borderWidth: 1, borderColor: '#DDD', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 6 },
  swatchBox: { width: rf(44), height: rf(44), borderRadius: rf(6), borderWidth: 1, borderColor: '#DDD', marginRight: rf(8) },
  swatchText: { fontSize: rf(13), color: '#111', fontWeight: '600' },
  swatchRoot: { position: 'absolute', right: rf(12), top: rf(12), zIndex: 9999, elevation: 20 },
  inlineSwatchRow: { width: '100%', alignItems: 'flex-start', marginBottom: rf(12) },
  swatchBoxLarge: { width: rf(104), height: rf(104), borderRadius: rf(12), borderWidth: 1, borderColor: '#DDD', backgroundColor: '#999' },
  processingOverlay: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 10000000, elevation: 100 },
  processingBox: { padding: rf(14), borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', zIndex: 10000001, elevation: 101 },
  processingText: { fontSize: rf(15), color: '#111', marginTop: rf(8), fontWeight: '600' },
  tapMarkerRoot: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' },
  tapMarkerDot: { position: 'absolute', width: rf(18), height: rf(18), borderRadius: rf(9), backgroundColor: 'rgba(0,200,80,0.95)', borderWidth: 2, borderColor: '#fff', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  debugSamplingBox: { position: 'absolute', borderWidth: 1, borderColor: '#FFFFFF', backgroundColor: 'rgba(0,255,0,0.15)', borderRadius: 2, zIndex: 1000, elevation: 10 },
  detectionDot: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: '#00FF00', borderWidth: 2, borderColor: '#FFFFFF', zIndex: 1001, elevation: 11, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  
  // Reference boxes styles
  referenceBoxContainer: { position: 'absolute', bottom: rf(12), left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', elevation: 20 },
  referenceBoxWrapper: { alignItems: 'center' },
  referenceBox: { borderWidth: 2, borderColor: '#FFF', backgroundColor: 'rgba(255,255,255,0.1)', position: 'relative' },
  referenceBoxLabel: { fontSize: rf(12), color: '#fff', fontWeight: '600', marginTop: rf(6), textAlign: 'center', maxWidth: rf(80) },
  referenceBoxDisabled: { opacity: 0.4 },
  referenceBoxControls: { flexDirection: 'row', marginTop: rf(8), gap: rf(8) },
  sizeControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, paddingHorizontal: rf(6), paddingVertical: rf(4) },
  sizeButton: { width: rf(28), height: rf(28), borderRadius: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF8C2B' },
  sizeButtonText: { color: '#fff', fontWeight: '700', fontSize: rf(16) },
  sizeText: { color: '#fff', fontSize: rf(11), fontWeight: '600', marginHorizontal: rf(6), minWidth: rf(40), textAlign: 'center' },
  toggleButton: { width: rf(32), height: rf(32), borderRadius: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2B7FFF' },
  toggleButtonText: { color: '#fff', fontWeight: '700', fontSize: rf(14) },
  warningContainer: { position: 'absolute', top: rf(12), left: rf(12), right: rf(12), backgroundColor: 'rgba(255,100,100,0.9)', paddingVertical: rf(10), paddingHorizontal: rf(12), borderRadius: 8, elevation: 15, maxWidth: '100%' },
  warningText: { color: '#fff', fontSize: rf(14), fontWeight: '600', textAlign: 'center' },
  // TEMPORARY: Comparison view styles
  comparisonContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: rf(16), paddingVertical: rf(12), paddingHorizontal: rf(8), backgroundColor: '#fff', borderRadius: rf(8), borderWidth: 1, borderColor: '#DDD', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  comparisonItem: { alignItems: 'center', flex: 1 },
  comparisonLabel: { fontSize: rf(12), color: '#666', fontWeight: '600', marginBottom: rf(8) },
  comparisonSwatch: { width: rf(80), height: rf(80), borderRadius: rf(8), borderWidth: 1, borderColor: '#DDD', marginBottom: rf(8), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  comparisonHex: { fontSize: rf(11), color: '#333', fontWeight: '700', fontFamily: 'monospace' },
  // Two-box white balance system
  twoBoxContainer: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, pointerEvents: 'none' },
  whiteBalanceBox: { position: 'absolute', borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 10 },
  whiteBalanceBoxDisabled: { opacity: 0.3, borderColor: '#888' },
  whiteBalanceBoxLabel: { position: 'absolute', bottom: rf(-24), left: 0, right: 0, fontSize: rf(11), color: '#FFFFFF', fontWeight: '600', textAlign: 'center', textShadowColor: '#000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  whiteBalanceWarning: { position: 'absolute', top: rf(12), left: rf(12), right: rf(12), backgroundColor: 'rgba(255,100,100,0.95)', paddingVertical: rf(10), paddingHorizontal: rf(14), borderRadius: rf(8), elevation: 15, zIndex: 10000 },
  whiteBalanceWarningText: { color: '#FFFFFF', fontSize: rf(13), fontWeight: '600', textAlign: 'center' },
  whiteBalanceToggle: { position: 'absolute', bottom: rf(12), left: rf(12), backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: rf(8), paddingHorizontal: rf(12), borderRadius: rf(6), flexDirection: 'row', alignItems: 'center', elevation: 10, zIndex: 10000 },
  whiteBalanceToggleText: { color: '#FFFFFF', fontSize: rf(12), fontWeight: '600', marginLeft: rf(6) },
  whiteBalanceToggleIcon: { color: '#FFFFFF', fontSize: rf(14), fontWeight: '800', marginRight: rf(6) },
  // When white balance is active (left box enabled) show a red "Disable" button
  whiteBalanceToggleActive: { backgroundColor: '#D9534F' },
  // When white balance is inactive show a green "Enable" button
  whiteBalanceToggleInactive: { backgroundColor: '#28A745' },
  cameraErrorBanner: { position: 'absolute', top: rf(44), left: rf(12), right: rf(12), backgroundColor: 'rgba(255,0,0,0.9)', paddingVertical: rf(10), paddingHorizontal: rf(12), borderRadius: rf(8), elevation: 20, zIndex: 10001 },
  cameraErrorText: { color: '#FFF', fontSize: rf(13), fontWeight: '700', textAlign: 'center' },
});
