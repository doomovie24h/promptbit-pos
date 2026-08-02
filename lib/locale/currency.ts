import { Language } from "@/types/language";
import { LOCALE_MAP, DEFAULT_CURRENCY_MAP } from "@/config/constants/locale";

export function formatCurrency(
  amount: number,
  language: Language,
  currencyCode?: string
): string {
  const locale = LOCALE_MAP[language] || "th-TH";
  const currency = currencyCode || DEFAULT_CURRENCY_MAP[language] || "THB";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount);
}