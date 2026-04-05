import React, { createContext, useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, type Theme, type ThemeName } from '../constants/themes';
import { DEFAULT_THEME, STORAGE_KEYS } from '../constants/config';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (name: ThemeName) => void;
  isLoaded: boolean;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: themes[DEFAULT_THEME],
  setTheme: () => {},
  isLoaded: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(DEFAULT_THEME);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.THEME).then((stored) => {
      if (stored && stored in themes) {
        setThemeName(stored as ThemeName);
      }
      setIsLoaded(true);
    });
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    AsyncStorage.setItem(STORAGE_KEYS.THEME, name);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: themes[themeName], setTheme, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
}
