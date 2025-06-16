import { useContext } from 'react';
import { useColorScheme } from 'react-native';
import { DarkModeContext } from '../app/context/DarkModeContext';

export const useDarkMode = () => {
  const { darkMode, setDarkMode } = useContext(DarkModeContext);
  const systemColorScheme = useColorScheme();
  const isDarkMode = darkMode === 'dark' || (darkMode === 'system' && systemColorScheme === 'dark');

  return { darkMode, setDarkMode, isDarkMode };
};
