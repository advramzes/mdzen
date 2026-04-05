export type ThemeName = 'emerald' | 'sepia' | 'dark';

export interface ThemeColors {
  primary: string;
  background: string;
  onBackground: string;
  surface: string;
  surfaceVariant: string;
  codeBg: string;
  border: string;
  tabBar: string;
  tabBarInactive: string;
  danger: string;
  onDanger: string;
  shadow: string;
  statusBarStyle: 'light' | 'dark';
}

export interface Theme {
  name: ThemeName;
  label: string;
  colors: ThemeColors;
}

const emerald: Theme = {
  name: 'emerald',
  label: 'Emerald Green',
  colors: {
    primary: '#22C55E',
    background: '#F0FDF4',
    onBackground: '#166534',
    surface: '#ECFDF5',
    surfaceVariant: '#FFFFFF',
    codeBg: '#F1F5F9',
    border: '#D1FAE5',
    tabBar: '#FFFFFF',
    tabBarInactive: '#94A3B8',
    danger: '#EF4444',
    onDanger: '#FFFFFF',
    shadow: '#000000',
    statusBarStyle: 'dark',
  },
};

const sepia: Theme = {
  name: 'sepia',
  label: 'Amber Sepia',
  colors: {
    primary: '#FB8C00',
    background: '#FDF6E3',
    onBackground: '#5D4037',
    surface: '#F5F5F5',
    surfaceVariant: '#FFFFFF',
    codeBg: '#FFF8E1',
    border: '#FFE0B2',
    tabBar: '#FFFFFF',
    tabBarInactive: '#A1887F',
    danger: '#EF4444',
    onDanger: '#FFFFFF',
    shadow: '#000000',
    statusBarStyle: 'dark',
  },
};

const dark: Theme = {
  name: 'dark',
  label: 'Dark Mode',
  colors: {
    primary: '#10B981',
    background: '#0F172A',
    onBackground: '#D1FAE5',
    surface: '#1E293B',
    surfaceVariant: '#1E293B',
    codeBg: '#0F172A',
    border: '#334155',
    tabBar: '#1E293B',
    tabBarInactive: '#64748B',
    danger: '#F87171',
    onDanger: '#FFFFFF',
    shadow: '#000000',
    statusBarStyle: 'light',
  },
};

export const themes: Record<ThemeName, Theme> = { emerald, sepia, dark };

export const themeNames: ThemeName[] = ['emerald', 'sepia', 'dark'];
