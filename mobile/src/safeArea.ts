import { Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** ATD / some Android images report 0 insets even with a status bar. */
export const ANDROID_STATUS_FALLBACK = 24;

export function androidStatusFallback(): number {
  if (Platform.OS !== 'android') return 0;
  return StatusBar.currentHeight && StatusBar.currentHeight > 0
    ? StatusBar.currentHeight
    : ANDROID_STATUS_FALLBACK;
}

export function useAppInsets() {
  const insets = useSafeAreaInsets();
  const androidTop = androidStatusFallback();
  return {
    top: Math.max(insets.top, androidTop),
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
  };
}
