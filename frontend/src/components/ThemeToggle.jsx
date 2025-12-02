import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      className="fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 text-2xl hover:scale-110 border border-gray-200 dark:border-gray-700"
      title="Toggle Light/Dark Mode"
    >
      {isDarkMode ? '🌞' : '🌙'}
    </button>
  );
}