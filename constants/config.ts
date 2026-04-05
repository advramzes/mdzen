import type { ThemeName } from './themes';
import { s, ms } from '../utils/scale';

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
  xs: s(4),
  sm: s(8),
  md: s(16),
  lg: s(24),
  xl: s(32),
  xxl: s(48),
} as const;

export const RADIUS = {
  button: s(12),
  card: s(16),
  sheet: s(24),
  fab: 50,
  input: s(12),
} as const;

export const ICON_SIZE = {
  inline: ms(20),
  nav: ms(24),
  accent: ms(32),
} as const;

export const FONT = {
  h1: ms(28),
  h2: ms(24),
  h3: ms(20),
  h4: ms(18),
  h5: ms(16),
  h6: ms(14),
  body: ms(16),
  code: ms(14),
  caption: ms(12),
  button: ms(16),
  sectionTitle: ms(20),
} as const;

export const LINE_HEIGHT = {
  h1: ms(36),
  h2: ms(31),
  h3: ms(28),
  h4: ms(25),
  h5: ms(24),
  h6: ms(22),
  body: ms(26),
  code: ms(21),
  caption: ms(17),
} as const;

export const MIN_TOUCH = 44;
