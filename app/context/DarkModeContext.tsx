import React, { createContext } from 'react';

export const DarkModeContext = createContext({
  darkMode: 'system',
  setDarkMode: (mode: 'light' | 'dark' | 'system') => {},
});

export default DarkModeContext;
