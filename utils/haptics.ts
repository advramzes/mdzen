import * as Haptics from 'expo-haptics';
import { AccessibilityInfo, Platform } from 'react-native';

let reducedMotion = false;

// Check reduced motion preference once at startup
AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
  reducedMotion = enabled;
});

// Store subscription for cleanup (module-level listener — lives for app lifetime)
const subscription = AccessibilityInfo.addEventListener(
  'reduceMotionChanged',
  (enabled: boolean) => {
    reducedMotion = enabled;
  },
);

// Note: subscription.remove() would be called on app teardown if needed.
// For a module-level singleton this is intentionally kept alive.

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

// Exported for testing — not used in production
export function cleanup() {
  subscription.remove();
}
