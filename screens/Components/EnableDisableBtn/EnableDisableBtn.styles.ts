import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const SCALE = Math.max(0.9, Math.min(width / 375, 1.18));
export const rf = (n: number) => Math.round(n * SCALE);

export const styles = StyleSheet.create({
  whiteBalanceToggle: { position: 'absolute', bottom: rf(12), left: rf(12), backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: rf(8), paddingHorizontal: rf(12), borderRadius: rf(6), flexDirection: 'row', alignItems: 'center', elevation: 10, zIndex: 10000 },
  whiteBalanceToggleText: { color: '#FFFFFF', fontSize: rf(12), fontWeight: '600', marginLeft: rf(6) },
  whiteBalanceToggleIcon: { color: '#FFFFFF', fontSize: rf(14), fontWeight: '800', marginRight: rf(6) },
  whiteBalanceToggleActive: { backgroundColor: '#D9534F' },
  whiteBalanceToggleInactive: { backgroundColor: '#28A745' },
});

