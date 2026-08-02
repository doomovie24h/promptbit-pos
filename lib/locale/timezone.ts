import { Language } from "@/types/language";
import { LOCALE_MAP, DEFAULT_TIMEZONE } from "@/config/constants/locale";

export function formatWithTimezone(
  date: Date | string | number,
  language: Language,
  timeZone: string = DEFAULT_TIMEZONE
): string {
  const locale = LOCALE_MAP[language] || "th-TH";
  const dateObj = new Date(date);

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "long",
    timeZone,
  }).format(dateObj);
}