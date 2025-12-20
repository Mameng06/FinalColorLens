import { StyleSheet } from 'react-native';
import { rf } from '../../ColorDetector/ColorDetector.styles';

export const styles = StyleSheet.create({
  freezeButton: { width: '100%', backgroundColor: '#FF8C2B', paddingVertical: rf(14), paddingHorizontal: rf(18), borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: rf(10) },
  unfreezeButton: { width: '100%', backgroundColor: '#2B7FFF', paddingVertical: rf(14), paddingHorizontal: rf(18), borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: rf(12) },
  freezeButtonText: { color: '#fff', fontWeight: '700', fontSize: rf(16) },
});
