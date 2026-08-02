"use client";

import { useContext } from "react";
import { LanguageContext } from "@/providers/language-provider";
import { Language } from "@/types/language";
import { ORDER_STATUS_TRANSLATIONS, OrderStatus } from "@/config/i18n/status";
import { ROLE_TRANSLATIONS, UserRole } from "@/config/i18n/roles";

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  const { language, setLanguage, t, isLoaded } = context;

  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang);
  };

  const translateStatus = (status: OrderStatus): string => {
    return ORDER_STATUS_TRANSLATIONS[language]?.[status] || status;
  };

  const translateRole = (role: UserRole): string => {
    return ROLE_TRANSLATIONS[language]?.[role] || role;
  };

  return {
    language,
    changeLanguage,
    t,
    isLoaded,
    translateStatus,
    translateRole,
  };
}