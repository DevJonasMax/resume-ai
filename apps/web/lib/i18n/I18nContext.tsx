"use client";

import React, { createContext, useCallback, useEffect, useState } from "react";
import { en_US, type LocaleTranslations } from "./locales/en_US.js";
import { pt_BR } from "./locales/pt_BR.js";

export type Locale = "en_US" | "pt_BR";

const STORAGE_KEY = "resume_ai_locale";

const dictionaries: Record<Locale, LocaleTranslations> = {
  en_US,
  pt_BR,
};

function getNestedTranslation(
  obj: Record<string, unknown>,
  path: string
): string | undefined {
  const segments = path.split(".");
  let current: unknown = obj;

  for (const segment of segments) {
    if (current && typeof current === "object" && segment in current) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}

function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, paramKey: string) => {
    if (paramKey in params) {
      return String(params[paramKey]);
    }
    return match;
  });
}

export interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const g = globalThis as unknown as {
  __i18n_context?: React.Context<I18nContextType | null>;
};
export const I18nContext = (g.__i18n_context ??= createContext<I18nContextType | null>(null));

export interface I18nProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
}

export function I18nProvider({
  children,
  defaultLocale = "en_US",
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored === "en_US" || stored === "pt_BR") {
        setLocaleState(stored);
      }
    }
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, nextLocale);
        document.documentElement.lang = nextLocale === "pt_BR" ? "pt-BR" : "en";
      } catch {
        // LocalStorage access issues in private mode
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = locale === "pt_BR" ? "pt-BR" : "en";
    }
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const currentDict = dictionaries[locale] as unknown as Record<string, unknown>;
      const fallbackDict = dictionaries.en_US as unknown as Record<string, unknown>;

      const translation =
        getNestedTranslation(currentDict, key) ??
        getNestedTranslation(fallbackDict, key) ??
        key;

      return interpolate(translation, params);
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
