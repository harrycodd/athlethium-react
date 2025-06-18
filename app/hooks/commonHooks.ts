/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                 COMMON HOOKS                                         ║
 * ║                                                                                      ║
 * ║ Consolidated custom React hooks for the entire application.                         ║
 * ║ Contains dark mode, user ID, theme color, and common header hooks.                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { getRefreshIconColor } from '../utils/commonUtils';

// ============================================================================
// DARK MODE HOOK
// ============================================================================

/**
 * Custom hook for managing dark mode state
 * Persists preference in AsyncStorage and provides toggle functionality
 */
export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDarkModePreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem('darkMode');
        if (savedPreference !== null) {
          setIsDarkMode(JSON.parse(savedPreference));
        }
      } catch (error) {
        console.warn('Error loading dark mode preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDarkModePreference();
  }, []);

  const toggleDarkMode = useCallback(async () => {
    try {
      const newValue = !isDarkMode;
      setIsDarkMode(newValue);
      await AsyncStorage.setItem('darkMode', JSON.stringify(newValue));
    } catch (error) {
      console.warn('Error saving dark mode preference:', error);
    }
  }, [isDarkMode]);

  return {
    isDarkMode,
    toggleDarkMode,
    isLoading
  };
};

// ============================================================================
// COLOR SCHEME HOOK
// ============================================================================

/**
 * Hook to get system color scheme
 * Returns 'light' or 'dark' based on system preference
 */
export const useColorScheme = () => {
  return useSystemColorScheme() ?? 'light';
};

// ============================================================================
// THEME COLOR HOOK
// ============================================================================

/**
 * Hook to get theme-aware colors
 * @param props - Object containing light and dark color options
 * @param colorName - Name of the color in Colors constant
 * @returns The appropriate color based on current theme
 */
export const useThemeColor = (
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) => {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
};

// ============================================================================
// USER ID HOOK
// ============================================================================

/**
 * Custom hook for managing user ID state
 * Handles user authentication state and persistence
 */
export const useUserId = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        setError(null);
        const savedUserId = await AsyncStorage.getItem('userId');
        setUserId(savedUserId);
      } catch (err) {
        console.warn('Error loading user ID:', err);
        setError('Failed to load user ID');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserId();
  }, []);

  const saveUserId = useCallback(async (newUserId: string) => {
    try {
      setError(null);
      await AsyncStorage.setItem('userId', newUserId);
      setUserId(newUserId);
    } catch (err) {
      console.warn('Error saving user ID:', err);
      setError('Failed to save user ID');
      throw err;
    }
  }, []);

  const clearUserId = useCallback(async () => {
    try {
      setError(null);
      await AsyncStorage.removeItem('userId');
      setUserId(null);
    } catch (err) {
      console.warn('Error clearing user ID:', err);
      setError('Failed to clear user ID');
      throw err;
    }
  }, []);

  const isAuthenticated = useMemo(() => {
    return userId !== null && userId.trim() !== '';
  }, [userId]);

  return {
    userId,
    isLoading,
    error,
    isAuthenticated,
    saveUserId,
    clearUserId
  };
};

// ============================================================================
// COMMON HEADER HOOK
// ============================================================================

/**
 * Custom hook for common header configuration
 * Provides consistent header styling and refresh functionality
 */
export const useCommonHeader = (onRefresh?: () => void) => {
  const { isDarkMode } = useDarkMode();

  const refreshIconColor = useMemo(() => {
    return getRefreshIconColor(isDarkMode);
  }, [isDarkMode]);

  const headerStyle = useMemo(() => ({
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
  }), [isDarkMode]);

  const headerTitleStyle = useMemo(() => ({
    color: isDarkMode ? '#ffffff' : '#000000',
  }), [isDarkMode]);

  const headerTintColor = useMemo(() => {
    return isDarkMode ? '#ffffff' : '#000000';
  }, [isDarkMode]);

  const statusBarStyle = useMemo(() => {
    return isDarkMode ? 'light-content' : 'dark-content';
  }, [isDarkMode]);

  // Configure status bar
  useEffect(() => {
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle(statusBarStyle as any, true);
    }
  }, [statusBarStyle]);

  const headerOptions = useMemo(() => ({
    headerStyle,
    headerTitleStyle,
    headerTintColor,
    headerRight: onRefresh ? () => (
      // This would typically be a pressable component
      // Implementation depends on navigation library
      null
    ) : undefined,
  }), [headerStyle, headerTitleStyle, headerTintColor, onRefresh]);

  return {
    headerOptions,
    refreshIconColor,
    isDarkMode,
    onRefresh
  };
};

// ============================================================================
// STORAGE HOOK
// ============================================================================

/**
 * Generic hook for AsyncStorage operations
 * @param key - Storage key
 * @param defaultValue - Default value if nothing is stored
 */
export const useAsyncStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadValue = async () => {
      try {
        setError(null);
        const stored = await AsyncStorage.getItem(key);
        if (stored !== null) {
          setValue(JSON.parse(stored));
        }
      } catch (err) {
        console.warn(`Error loading ${key}:`, err);
        setError(`Failed to load ${key}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadValue();
  }, [key]);

  const updateValue = useCallback(async (newValue: T) => {
    try {
      setError(null);
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
      setValue(newValue);
    } catch (err) {
      console.warn(`Error saving ${key}:`, err);
      setError(`Failed to save ${key}`);
      throw err;
    }
  }, [key]);

  const removeValue = useCallback(async () => {
    try {
      setError(null);
      await AsyncStorage.removeItem(key);
      setValue(defaultValue);
    } catch (err) {
      console.warn(`Error removing ${key}:`, err);
      setError(`Failed to remove ${key}`);
      throw err;
    }
  }, [key, defaultValue]);

  return {
    value,
    isLoading,
    error,
    updateValue,
    removeValue
  };
};
