import { Dimensions } from 'react-native';

const BASE_WIDTH = 375;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCALE_FACTOR = SCREEN_WIDTH / BASE_WIDTH;

/**
 * Scale a value proportionally to screen width.
 * For font sizes and spacing that should grow/shrink with screen.
 * Clamped to avoid extremes on very small or very large screens.
 */
export function s(size: number): number {
  const scaled = size * Math.min(Math.max(SCALE_FACTOR, 0.85), 1.5);
  return Math.round(scaled * 2) / 2; // round to nearest 0.5
}

/**
 * Moderate scale — scales less aggressively (factor 0.5).
 * Good for font sizes that shouldn't vary as dramatically.
 */
export function ms(size: number, factor = 0.5): number {
  const scaled = size + (s(size) - size) * factor;
  return Math.round(scaled * 2) / 2;
}

/**
 * Minimum touch target — ensures at least 44pt.
 */
export function touchTarget(size: number): number {
  return Math.max(s(size), 44);
}
