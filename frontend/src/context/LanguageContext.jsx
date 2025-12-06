// /frontend/src/context/LanguageContext.jsx

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

  // 3. Translation Helper Function (FIXED to handle dots like 'dashboard.welcomeBack')
  const t = (key) => {
    if (!key) return ""; 
    
    // Split "dashboard.welcomeBack" into ["dashboard", "welcomeBack"]
    const keys = key.split('.'); 
    let value = translations[language];

    // Drill down into the object
    for (let k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // If translation is missing, return the key so we can see what's wrong
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