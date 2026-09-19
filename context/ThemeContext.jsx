import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';

const THEME_STORAGE_KEY = '@app_theme_mode';

export const ThemeContext = createContext({
  themeMode: 'system', // 'system' | 'light' | 'dark'
  setThemeMode: () => {},
  effectiveTheme: 'light', // 'light' | 'dark'
  isDark: false,
  colors: Colors.light,
});

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeModeState] = useState('system');
  const [systemScheme, setSystemScheme] = useState(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );

  // Listen to OS system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => subscription.remove();
  }, []);

  // Restore saved theme preference from storage on mount
  useEffect(() => {
    let isMounted = true;
    const loadThemePreference = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (isMounted && savedMode && (savedMode === 'system' || savedMode === 'light' || savedMode === 'dark')) {
          setThemeModeState(savedMode);
        }
      } catch (err) {
        console.warn('Failed to load theme preference from AsyncStorage', err);
      }
    };
    loadThemePreference();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update & persist theme selection
  const setThemeMode = useCallback(async (newMode) => {
    if (newMode !== 'system' && newMode !== 'light' && newMode !== 'dark') return;
    setThemeModeState(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (err) {
      console.warn('Failed to save theme preference to AsyncStorage', err);
    }
  }, []);

  // Compute effective theme & active color palette
  const effectiveTheme = themeMode === 'system' ? systemScheme : themeMode;
  const isDark = effectiveTheme === 'dark';

  const value = useMemo(() => {
    const activePalette = Colors[effectiveTheme] || Colors.light;
    return {
      themeMode,
      setThemeMode,
      effectiveTheme,
      isDark,
      colors: activePalette,
    };
  }, [themeMode, effectiveTheme, isDark, setThemeMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
