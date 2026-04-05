import * as Haptics from 'expo-haptics';
import { AccessibilityInfo, Platform } from 'react-native';

let reducedMotion = false;

// Check reduced motion preference once at startup
AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
  reducedMotion = enabled;
});

AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
  reducedMotion = enabled;
});

export function isReducedMotion(): boolean {
  return reducedMotion;
}

export function lightHaptic() {
  if (Platform.OS === 'web' || reducedMotion) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function mediumHaptic() {
  if (Platform.OS === 'web' || reducedMotion) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}
