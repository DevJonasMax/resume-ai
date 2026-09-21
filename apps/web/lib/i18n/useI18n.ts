"use client";

import { useContext } from "react";
import { I18nContext, type I18nContextType } from "./I18nContext.js";
import { pt_BR } from "./locales/pt_BR.js";

function getFallbackTranslation(key: string, params?: Record<string, string | number>): string {
  const segments = key.split(".");
  let current: unknown = pt_BR;
  for (const segment of segments) {
    if (current && typeof current === "object" && segment in current) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return key;
    }
  }
  let str = typeof current === "string" ? current : key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
}

const fallbackContext: I18nContextType = {
  locale: "pt_BR",
  setLocale: () => {},
  t: getFallbackTranslation,
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  return context ?? fallbackContext;
}

