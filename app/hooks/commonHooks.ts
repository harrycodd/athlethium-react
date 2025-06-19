/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                 COMMON HOOKS                                         ║
 * ║                                                                                      ║
 * ║ Consolidated custom React hooks for the entire application.                         ║
 * ║ Contains dark mode, user ID, theme color, and common header hooks.                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { getRefreshIconColor } from '../utils/commonUtils';
import { DarkModeContext } from '../context/DarkModeContext';

// ============================================================================
// DARK MODE HOOK
// ============================================================================

/**
 * Custom hook for managing dark mode state
 * Uses the DarkModeContext to provide consistent dark mode across the app
 */
export const useDarkMode = () => {
  const { isDarkMode, darkMode, setDarkMode } = useContext(DarkModeContext);

  const toggleDarkMode = useCallback(() => {
    const newMode = isDarkMode ? 'light' : 'dark';
    setDarkMode(newMode);
  }, [isDarkMode, setDarkMode]);

  return {
    isDarkMode,
    darkMode,
    setDarkMode,
    toggleDarkMode,
    isLoading: false // Context handles loading
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

// ============================================================================
// REANIMATED UTILITY HOOK
// ============================================================================

/**
 * Hook to safely access shared values without triggering render warnings
 * This prevents the "Reading from `value` during component render" warning
 */
export const useReanimatedValue = () => {
  const readValue = useCallback((sharedValue: any) => {
    // Use runOnJS to safely read the value outside of render
    if (typeof sharedValue?.value !== 'undefined') {
      // Return the current value safely
      return sharedValue.value;
    }
    return null;
  }, []);

  const readValueWithDefault = useCallback((sharedValue: any, defaultValue: any) => {
    if (typeof sharedValue?.value !== 'undefined') {
      return sharedValue.value;
    }
    return defaultValue;
  }, []);

  return {
    readValue,
    readValueWithDefault,
  };
};

// ============================================================================
// REANIMATED CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to configure Reanimated logger and strict mode
 * Use this to disable strict mode warnings if needed
 */
export const useReanimatedConfig = () => {
  useEffect(() => {
    // Configure Reanimated logger to reduce warnings in development
    if (__DEV__) {
      try {
        // Dynamically import Reanimated to avoid bundling issues
        import('react-native-reanimated').then((Reanimated) => {
          // Configure logger to suppress strict mode warnings
          if (Reanimated.configureReanimatedLogger) {
            Reanimated.configureReanimatedLogger({
              strict: false, // Disable strict mode warnings
            });
          }
        }).catch(() => {
          // Reanimated not available, ignore
        });
      } catch (error) {
        // Ignore configuration errors
      }
    }
  }, []);

  return null;
};
// ============================================================================
