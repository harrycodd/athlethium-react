import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DarkModeType = 'light' | 'dark' | 'system';

interface DarkModeContextType {
  darkMode: DarkModeType;
  setDarkMode: (mode: DarkModeType) => void;
  isDarkMode: boolean;
}

export const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: 'system',
  setDarkMode: () => {},
  isDarkMode: false,
});

interface DarkModeProviderProps {
  children: ReactNode;
}

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  const [darkMode, setDarkModeState] = useState<DarkModeType>('system');
  const systemColorScheme = useColorScheme();

  // Calculate actual isDarkMode based on setting and system preference
  const isDarkMode = darkMode === 'dark' || (darkMode === 'system' && systemColorScheme === 'dark');

  // Load dark mode preference on mount
  useEffect(() => {
    const loadDarkModePreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem('darkModePreference');
        if (savedPreference && ['light', 'dark', 'system'].includes(savedPreference)) {
          setDarkModeState(savedPreference as DarkModeType);
        }
      } catch (error) {
        console.warn('Error loading dark mode preference:', error);
      }
    };

    loadDarkModePreference();
  }, []);

  // Save preference when it changes
  const setDarkMode = async (mode: DarkModeType) => {
    try {
      setDarkModeState(mode);
      await AsyncStorage.setItem('darkModePreference', mode);
    } catch (error) {
      console.warn('Error saving dark mode preference:', error);
    }
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode, isDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export default DarkModeContext;
