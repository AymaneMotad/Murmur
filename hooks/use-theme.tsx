import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { getUserPreferences, saveUserPreferences, UserPreferences } from '@/lib/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

type Theme = typeof Colors.light;

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const theme = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const preferences = await getUserPreferences();
        const savedTheme = (preferences as any).themeMode || 'system';
        setThemeModeState(savedTheme);
      } catch (error) {
        console.error('Error loading theme preference:', error);
        setThemeModeState('system');
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      const preferences = await getUserPreferences();
      const updatedPreferences = {
        ...preferences,
        themeMode: mode,
      } as UserPreferences & { themeMode: ThemeMode };
      await saveUserPreferences(updatedPreferences as UserPreferences);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  return React.createElement(
    ThemeContext.Provider,
    { value: { theme, themeMode, setThemeMode, isDark } },
    children
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
