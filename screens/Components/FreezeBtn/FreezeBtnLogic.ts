export function handleFreezeToggle(onToggle?: () => void) {
  try {
    if (typeof onToggle === 'function') onToggle();
  } catch (e) {
    // swallow errors to avoid breaking UI
    console.warn('Freeze toggle handler error', e);
  }
}
