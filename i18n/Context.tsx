import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Language, Translation, I18nContextType } from './types';
import enTranslations from './en';
import zhTranslations from './zh';

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'smartbim_language';

const translations: Record<Language, Translation> = {
  en: enTranslations,
  zh: zhTranslations,
};

export interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const loadLanguage = useCallback((): Language => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (stored === 'en' || stored === 'zh')) {
        return stored;
      }
    } catch (error) {
      console.error('Failed to load language from localStorage:', error);
    }
    return 'en';
  }, []);

  useEffect(() => {
    const savedLanguage = loadLanguage();
    setLanguage(savedLanguage);
  }, [loadLanguage]);

  const saveLanguage = useCallback((lang: Language) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      console.error('Failed to save language to localStorage:', error);
    }
  }, []);

  const switchLanguage = useCallback(() => {
    const newLanguage: Language = language === 'en' ? 'zh' : 'en';
    setLanguage(newLanguage);
    saveLanguage(newLanguage);
  }, [language, saveLanguage]);

  return (
    <I18nContext.Provider value={{
      language,
      translations: translations[language],
      switchLanguage,
    }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
