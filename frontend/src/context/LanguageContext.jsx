import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // 1. Load saved language or default to 'en'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('mindfulLang') || 'en';
  });

  // 2. Save language to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mindfulLang', language);
  }, [language]);

  // 3. Translation Helper Function
  // Usage: t('heroTitle') -> Returns the string in the current language
  const t = (key) => {
    return translations[language][key] || key; // Fallback to key if missing
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom Hook for easy access
export function useLanguage() {
  return useContext(LanguageContext);
}