// Font loader utility to ensure Canvas fillText renders with loaded Google Fonts
export async function ensureFontsLoaded() {
  if ('fonts' in document) {
    try {
      await document.fonts.ready;
      return true;
    } catch (err) {
      console.warn('Font loading check error:', err);
      return false;
    }
  }
  return true;
}
