"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Language } from "@/types/language";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/config/i18n/languages";
import { translations } from "@/config/i18n/translations";
import { TranslationKeys } from "@/config/i18n/translation-key";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  isLoaded: boolean;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "promptbit_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
      setLanguageState(savedLang);
    }
    setIsLoaded(true);
  }, []);

  const setLanguage = (lang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const t = useMemo(() => {
    return translations[language] || translations[DEFAULT_LANGUAGE];
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
}

// --- เพิ่ม Custom Hook ตรงนี้เพื่อเรียกใช้อย่างสะดวก ---
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}