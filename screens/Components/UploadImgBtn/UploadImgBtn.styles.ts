import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const SCALE = Math.max(0.9, Math.min(width / 375, 1.18));
const rf = (n: number) => Math.round(n * SCALE);

export const styles = StyleSheet.create({
  uploadButton: { width: '50%', backgroundColor: '#6A0DAF', paddingVertical: rf(14), paddingHorizontal: rf(14), borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 0 },
  uploadButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  uploadIcon: { width: rf(20), height: rf(20), marginRight: rf(8), tintColor: '#fff', resizeMode: 'contain' },
  uploadButtonText: { color: '#fff', fontWeight: '700', fontSize: rf(16) },
});

