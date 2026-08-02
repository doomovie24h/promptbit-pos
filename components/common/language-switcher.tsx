"use client";

import { useLanguage } from "@/hooks/use-language";
import { Language } from "@/types/language";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 rounded-2xl border bg-card p-1.5 shadow-sm">
      <Globe className="ml-1 h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => changeLanguage("th")}
          className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
            language === "th"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          TH
        </button>
        <button
          type="button"
          onClick={() => changeLanguage("en")}
          className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
            language === "en"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
}