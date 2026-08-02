import { Language } from "@/types/language";
import { LOCALE_MAP, DEFAULT_TIMEZONE } from "@/config/constants/locale";

export function formatDate(
  date: Date | string | number,
  language: Language,
  options?: Intl.DateTimeFormatOptions
): string {
  const locale = LOCALE_MAP[language] || "th-TH";
  const dateObj = new Date(date);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: DEFAULT_TIMEZONE,
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
}

export function formatDateTime(
  date: Date | string | number,
  language: Language
): string {
  return formatDate(date, language, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}