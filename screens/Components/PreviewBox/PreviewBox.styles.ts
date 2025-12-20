import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const SCALE = Math.max(0.9, Math.min(width / 375, 1.18));
const rf = (n: number) => Math.round(n * SCALE);

export const styles = StyleSheet.create({
  swatchRoot: {
    position: 'relative',
  },
  colorSwatchContainer: {
    marginBottom: rf(12),
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
  },
  colorSwatch: {
    width: rf(70),
    height: rf(70),
    borderRadius: rf(6),
    borderWidth: 0,
  },
  swatchBox: {
    width: 44,
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDD',
    marginRight: 8,
  },
  swatchText: {
    fontSize: 13,
    color: '#111',
    fontWeight: '600',
  },
});
