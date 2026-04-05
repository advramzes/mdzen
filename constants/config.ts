import type { ThemeName } from './themes';

export const APP_NAME = 'MDZen';
export const APP_VERSION = '1.0.0';
export const COPYRIGHT = '\u00A9 2026 Miftakhov Ramzes';
export const WEBSITE = 'https://ramzes-it.ru/?utm_source=mdzen&utm_medium=apk';

export const DEFAULT_THEME: ThemeName = 'emerald';

export const STORAGE_KEYS = {
  THEME: '@mdzen/theme',
  RECENT_FILES: '@mdzen/recent-files',
  SCROLL_PREFIX: '@mdzen/scroll/',
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
