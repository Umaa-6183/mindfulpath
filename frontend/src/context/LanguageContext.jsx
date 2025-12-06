// /frontend/src/context/LanguageContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // 1. Load saved language, BUT ensure it actually exists in our dictionary
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('mindfulLang');
    // Safety Check: If saved lang is "en-US" but we only have "en", fallback to "en"
    if (saved && translations[saved]) {
      return saved;
    }
    return 'en';
  });

  // 2. Save language to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mindfulLang', language);
  }, [language]);

  // 3. Translation Helper Function
  const t = (key) => {
    if (!key) return ""; 
    
    // Safety Check: Ensure we have a valid language object. 
    // If 'fr' is selected but missing, fallback to 'en' immediately to prevent crashes.
    const currentDict = translations[language] || translations['en'];

    const keys = key.split('.'); 
    let value = currentDict;

    // Drill down into the object (e.g. landing -> heroTitle)
    for (let k of keys) {
      // Check if value exists and has the key
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        // If missing, return key so we know it's broken
        return key; 
      }
    }
    
    return value;
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