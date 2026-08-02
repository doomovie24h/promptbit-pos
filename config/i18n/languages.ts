import { Language } from "@/types/language";

export const languages = {
  TH: "th",
  EN: "en",
} as const;

export const DEFAULT_LANGUAGE: Language = "th";

export const SUPPORTED_LANGUAGES: Language[] = ["th", "en"];