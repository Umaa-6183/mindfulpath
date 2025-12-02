import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // 1. Initialize state: Check LocalStorage first, otherwise default to Light Mode (false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('mindfulTheme');
    return savedTheme === 'dark'; // Returns true if 'dark', false otherwise
  });

  // 2. Update the HTML class & LocalStorage when state changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('mindfulTheme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('mindfulTheme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use it easily in components
export function useTheme() {
  return useContext(ThemeContext);
}