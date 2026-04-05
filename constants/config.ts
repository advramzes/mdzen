import type { ThemeName } from './themes';

export const DEFAULT_THEME: ThemeName = 'emerald';

export const STORAGE_KEYS = {
  THEME: '@mdzen/theme',
  RECENT_FILES: '@mdzen/recent-files',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  button: 12,
  card: 16,
  sheet: 24,
  fab: 50,
  input: 12,
} as const;

export const ICON_SIZE = {
  inline: 20,
  nav: 24,
  accent: 32,
} as const;
