import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n, { initLocale, setLocale as changeLocale, LANGUAGES } from '@/i18n';

type LanguageContextType = {
  t: (key: string, options?: object) => string;
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  languages: typeof LANGUAGES;
};

const LanguageContext = createContext<LanguageContextType>({
  t: (key: string) => key,
  locale: 'en',
  setLocale: async () => {},
  languages: LANGUAGES,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState('en');

  useEffect(() => {
    const loadLocale = async () => {
      const savedLocale = await initLocale();
      setLocaleState(savedLocale);
    };
    
    loadLocale();
  }, []);

  const setLocale = async (newLocale: string) => {
    await changeLocale(newLocale);
    setLocaleState(newLocale);
  };

  const t = (key: string, options?: object) => {
    return i18n.t(key, options);
  };

  return (
    <LanguageContext.Provider value={{ t, locale, setLocale, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);