import { Language } from "@/types/language";
import { LOCALE_MAP } from "@/config/constants/locale";

export function formatNumber(
  value: number,
  language: Language,
  options?: Intl.NumberFormatOptions
): string {
  const locale = LOCALE_MAP[language] || "th-TH";
  return new Intl.NumberFormat(locale, options).format(value);
}