export function getToggleLabel(enabled: boolean): string {
  try { return enabled ? 'Disable White Balance' : 'Enable White Balance'; } catch { return enabled ? 'Disable White Balance' : 'Enable White Balance'; }
}

export function getToggleIcon(enabled: boolean): string {
  try { return enabled ? '✕' : '✓'; } catch { return enabled ? '✕' : '✓'; }
}

