"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Globe02Icon } from "@hugeicons/core-free-icons";
import { useI18n } from "./useI18n.js";
import type { Locale } from "./I18nContext.js";

export interface LanguageSwitcherProps {
  variant?: "segmented" | "compact" | "full";
  className?: string;
}

export function LanguageSwitcher({
  variant = "segmented",
  className = "",
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();

  const handleSelect = (nextLocale: Locale) => {
    if (nextLocale !== locale) {
      setLocale(nextLocale);
    }
  };

  if (variant === "full") {
    return (
      <div
        className={`flex items-center justify-between px-2.5 py-1.5 bg-[#121417] rounded-lg border border-[rgba(255,255,255,0.06)] ${className}`}
      >
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Globe02Icon} size={14} className="text-zinc-400" />
          <span className="text-[10px] font-mono text-zinc-400">
            {t("common.language")}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleSelect("en_US")}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition-colors cursor-pointer ${
              locale === "en_US"
                ? "bg-[#20242a] text-[#a7f3d0] border border-[#a7f3d0]/30 shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title="English (United States)"
          >
            EN
          </button>
          <span className="text-zinc-600 text-[10px]">•</span>
          <button
            type="button"
            onClick={() => handleSelect("pt_BR")}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition-colors cursor-pointer ${
              locale === "pt_BR"
                ? "bg-[#20242a] text-[#a7f3d0] border border-[#a7f3d0]/30 shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title="Português (Brasil)"
          >
            PT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-[#121417] px-2 py-1 rounded-lg border border-[rgba(255,255,255,0.08)] ${className}`}
      role="group"
      aria-label={t("common.language")}
    >
      <HugeiconsIcon
        icon={Globe02Icon}
        size={13}
        className="text-zinc-500 shrink-0"
      />
      <div className="inline-flex items-center gap-0.5 font-mono text-[10px]">
        <button
          type="button"
          onClick={() => handleSelect("en_US")}
          className={`px-1.5 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
            locale === "en_US"
              ? "bg-[#20242a] text-[#a7f3d0] border border-[#a7f3d0]/30 shadow-xs"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
          title="English"
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => handleSelect("pt_BR")}
          className={`px-1.5 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
            locale === "pt_BR"
              ? "bg-[#20242a] text-[#a7f3d0] border border-[#a7f3d0]/30 shadow-xs"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
          title="Português"
        >
          PT
        </button>
      </div>
    </div>
  );
}
