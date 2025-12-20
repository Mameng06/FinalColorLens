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
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: rf(10),
  },
  colorSwatch: {
    width: rf(80),
    height: rf(80),
    borderRadius: rf(6),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: rf(12),
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
    fontSize: rf(16),
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
});
