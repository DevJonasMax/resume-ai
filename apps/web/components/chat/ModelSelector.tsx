import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  CheckmarkCircle02Icon,
  CpuIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { apiClient } from "@/lib/apiClient.js";

export interface ModelOption {
  id: string;
  name: string;
  tag: string;
  badgeVariant: "sky" | "lavender" | "sage" | "apricot";
}

export const GEMINI_MODELS_METADATA: ModelOption[] = [
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    tag: "Recommended",
    badgeVariant: "sky",
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    tag: "Ultra Fast",
    badgeVariant: "sage",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    tag: "Deep Reasoning",
    badgeVariant: "lavender",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    tag: "Next-Gen Fast",
    badgeVariant: "sky",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    tag: "Large Context",
    badgeVariant: "lavender",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    tag: "Balanced",
    badgeVariant: "apricot",
  },
];

export interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  className?: string;
}

export function ModelSelector({
  selectedModel,
  onSelectModel,
  className = "",
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableModels, setAvailableModels] = useState<ModelOption[]>(GEMINI_MODELS_METADATA);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch registered models from backend if available
  useEffect(() => {
    let mounted = true;
    apiClient
      .getAiModels()
      .then((data) => {
        if (!mounted || !data?.models || data.models.length === 0) return;
        const merged = data.models.map((mId) => {
          const existing = GEMINI_MODELS_METADATA.find((m) => m.id === mId);
          if (existing) return existing;
          return {
            id: mId,
            name: mId.replace("gemini-", "Gemini ").replace("-", " "),
            tag: "Gemini",
            badgeVariant: "sky" as const,
          };
        });
        setAvailableModels(merged);
      })
      .catch(() => {
        // Fallback silently to GEMINI_MODELS_METADATA
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const activeOption =
    availableModels.find((m) => m.id === selectedModel) ||
    availableModels[0] ||
    GEMINI_MODELS_METADATA[0];

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181b1f] hover:bg-[#20252c] border border-[rgba(255,255,255,0.08)] hover:border-[#d8b4fe]/40 text-xs text-zinc-200 transition-all duration-150 cursor-pointer active:scale-95 select-none"
        title="Select Active AI Model"
      >
        <HugeiconsIcon icon={CpuIcon} size={13} className="text-[#d8b4fe]" />
        <span className="font-medium text-[11px] max-w-[120px] truncate">
          {activeOption.name}
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={12}
          className={`text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-64 rounded-xl bg-[#121417] border border-[rgba(255,255,255,0.1)] shadow-[0_12px_32px_rgba(0,0,0,0.6)] p-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-[rgba(255,255,255,0.06)] mb-1 flex items-center justify-between">
            <span>Gemini Non-Deprecated</span>
            <HugeiconsIcon icon={SparklesIcon} size={11} className="text-[#d8b4fe]" />
          </div>

          <div className="flex flex-col gap-0.5 max-h-56 overflow-y-auto">
            {availableModels.map((model) => {
              const isSelected = model.id === activeOption.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer active:scale-95 text-left ${
                    isSelected
                      ? "bg-[#251e33] text-white border border-[#d8b4fe]/30 font-semibold"
                      : "text-zinc-300 hover:bg-[#181b1f] hover:text-white"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] leading-tight">{model.name}</span>
                    <span className="text-[9px] text-zinc-500 font-mono">{model.id}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        model.badgeVariant === "lavender"
                          ? "bg-[rgba(216,180,254,0.12)] text-[#d8b4fe]"
                          : model.badgeVariant === "sage"
                          ? "bg-[rgba(167,243,208,0.12)] text-[#a7f3d0]"
                          : model.badgeVariant === "apricot"
                          ? "bg-[rgba(253,186,116,0.12)] text-[#fdba74]"
                          : "bg-[rgba(147,197,253,0.12)] text-[#93c5fd]"
                      }`}
                    >
                      {model.tag}
                    </span>

                    {isSelected && (
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        size={13}
                        className="text-[#d8b4fe] shrink-0"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
