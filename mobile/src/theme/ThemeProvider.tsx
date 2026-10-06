import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {Appearance, useColorScheme} from 'react-native';
import {
  darkColors,
  lightColors,
  navigationThemeFromColors,
  type ThemeColors,
} from '../config/theme';
import {
  preferencesStorage,
  type AppPreferences,
  type ThemePreference,
} from '../storage/preferencesStorage';

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedScheme: 'light' | 'dark';
  colors: ThemeColors;
  isDark: boolean;
  preferences: AppPreferences;
  navigationTheme: ReturnType<typeof navigationThemeFromColors>;
  setThemePreference: (theme: ThemePreference) => void;
  updatePreferences: (partial: Partial<AppPreferences>) => void;
  reducedMotion: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({children}: {children: ReactNode}) {
  const systemScheme = useColorScheme();
  const [preferences, setPreferences] = useState<AppPreferences>(() =>
    preferencesStorage.get(),
  );

  const resolvedScheme: 'light' | 'dark' = useMemo(() => {
    if (preferences.theme === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return preferences.theme;
  }, [preferences.theme, systemScheme]);

  const colors: ThemeColors =
    resolvedScheme === 'dark' ? darkColors : lightColors;
  const isDark = resolvedScheme === 'dark';

  useEffect(() => {
    if (preferences.theme === 'system') {
      return;
    }
    Appearance.setColorScheme(preferences.theme);
  }, [preferences.theme]);

  const setThemePreference = useCallback((theme: ThemePreference) => {
    setPreferences(preferencesStorage.set({theme}));
  }, []);

  const updatePreferences = useCallback((partial: Partial<AppPreferences>) => {
    setPreferences(preferencesStorage.set(partial));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference: preferences.theme,
      resolvedScheme,
      colors,
      isDark,
      preferences,
      navigationTheme: navigationThemeFromColors(colors, isDark),
      setThemePreference,
      updatePreferences,
      reducedMotion: preferences.reducedMotion,
    }),
    [
      preferences,
      resolvedScheme,
      colors,
      isDark,
      setThemePreference,
      updatePreferences,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

/** Safe hook when provider might be absent (boot errors). */
export function useThemeColors(): ThemeColors {
  const ctx = useContext(ThemeContext);
  return ctx?.colors ?? lightColors;
}
