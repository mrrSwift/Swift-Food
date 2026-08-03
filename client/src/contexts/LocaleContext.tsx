import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import en from '@/locales/en.json';
import fa from '@/locales/fa.json';

type Direction = 'ltr' | 'rtl';
type Language = 'en' | 'fa';

interface LocaleContextType {
  direction: Direction;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleDirection: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const messages: Record<Language, any> = { en, fa };

const LocaleContext = createContext<LocaleContextType>({
  direction: 'ltr',
  language: 'en',
  setLanguage: () => {},
  toggleDirection: () => {},
  t: (key: string) => key,
});

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return saved === 'fa' ? 'fa' : 'en';
  });

  const direction: Direction = language === 'fa' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language === 'fa' ? 'fa' : 'en';
    localStorage.setItem('app-language', language);
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleDirection = () => {
    setLanguage(language === 'en' ? 'fa' : 'en');
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    // Try current language first, then fallback to English, then return the key itself
    let text = getNestedValue(messages[language], key) 
            || getNestedValue(messages.en, key) 
            || key;
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{{${param}}}`, String(value));
      });
    }
    return text;
  };

  return (
    <LocaleContext.Provider value={{ direction, language, setLanguage, toggleDirection, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);

/** Helper to safely access nested JSON values using dot notation */
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}