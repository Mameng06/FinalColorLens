export function handleSwatchPress(onPress?: () => void) {
  try {
    if (typeof onPress === 'function') onPress();
  } catch (e) {
    // swallow errors from optional handlers
  }
}
