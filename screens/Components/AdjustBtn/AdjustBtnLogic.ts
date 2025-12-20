export function getAdjustLabel(adjusting: boolean): string {
  try {
    return adjusting ? 'Done' : 'Adjust Image';
  } catch (_e) {
    return adjusting ? 'Done' : 'Adjust Image';
  }
}

export function shouldShowHelp(adjusting: boolean): boolean {
  try {
    return !!adjusting;
  } catch (_e) {
    return !!adjusting;
  }
}

