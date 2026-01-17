import en from './en.json';
import zh from './zh.json';

export type Language = 'en' | 'zh';

export type Translations = typeof en;

export const translations: Record<Language, Translations> = {
  en,
  zh,
};

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

export function getLanguageName(lang: Language): string {
  const names: Record<Language, string> = {
    en: 'English',
    zh: '中文',
  };
  return names[lang];
}
