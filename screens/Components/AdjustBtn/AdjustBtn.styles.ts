import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const SCALE = Math.max(0.9, Math.min(width / 375, 1.18));
export const rf = (n: number) => Math.round(n * SCALE);

export const styles = StyleSheet.create({
  adjustArea: { position: 'absolute', top: rf(350), right: rf(8), alignItems: 'flex-end', zIndex: 10000000, elevation: 100, pointerEvents: 'box-none' },
  adjustButton: { backgroundColor: '#fff', paddingVertical: rf(10), paddingHorizontal: rf(12), borderRadius: rf(26), elevation: 101, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, zIndex: 10000001 },
  adjustButtonContent: { flexDirection: 'row', alignItems: 'center' },
  adjustIcon: { width: rf(20), height: rf(20), marginRight: rf(8), tintColor: '#6A0DAF', resizeMode: 'contain' },
  adjustText: { color: '#6A0DAF', fontWeight: '700', fontSize: rf(15) },
  adjustHelp: { marginTop: rf(8), paddingHorizontal: rf(12), backgroundColor: '#FF8C2B', paddingVertical: rf(10), borderRadius: 8, alignSelf: 'stretch', zIndex: 10000001, elevation: 101, position: 'relative' },
  adjustHelpText: { color: '#fff', fontSize: rf(14), textAlign: 'left', fontWeight: '600' },
});

