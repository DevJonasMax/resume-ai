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

/**
 * Active non-deprecated Gemini models adhering to official documentation:
 * https://ai.google.dev/gemini-api/docs/models
 * Note: Gemini 1.5 family is deprecated.
 */
export const GEMINI_ACTIVE_MODELS: ModelOption[] = [
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    tag: "Recommended",
    badgeVariant: "sky",
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    tag: "Next-Gen Fast",
    badgeVariant: "sky",
  },
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    tag: "Ultra Fast",
    badgeVariant: "sage",
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    tag: "Low Latency",
    badgeVariant: "sage",
  },
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    tag: "Reasoning",
    badgeVariant: "lavender",
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    tag: "Experimental",
    badgeVariant: "sky",
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    tag: "Deep ATS Pro",
    badgeVariant: "lavender",
  },
];

export interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  className?: string;
  isMock?: boolean;
}

export function ModelSelector({
  selectedModel,
  onSelectModel,
  className = "",
  isMock,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableModels, setAvailableModels] = useState<ModelOption[]>(GEMINI_ACTIVE_MODELS);
  const [isMockProvider, setIsMockProvider] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch registered models from backend if available, filtering out deprecated 1.5 models
  useEffect(() => {
    let mounted = true;
    apiClient
      .getAiModels()
      .then((data) => {
        if (!mounted || !data) return;
        if (typeof data.isMock === "boolean") {
          setIsMockProvider(data.isMock);
        }
        if (!data.models || data.models.length === 0) return;
        const filtered = data.models
          .filter((mId) => !mId.includes("1.5"))
          .map((mId) => {
            const existing = GEMINI_ACTIVE_MODELS.find((m) => m.id === mId);
            if (existing) return existing;
            return {
              id: mId,
              name: mId.replace("gemini-", "Gemini ").replace("-", " "),
              tag: "Active",
              badgeVariant: "sky" as const,
            };
          });

        if (filtered.length > 0) {
          // Merge with predefined active models so new 3.x models are always present
          const merged = [...GEMINI_ACTIVE_MODELS];
          for (const item of filtered) {
            if (!merged.some((m) => m.id === item.id)) {
              merged.push(item);
            }
          }
          setAvailableModels(merged);
        }
      })
      .catch(() => {
        // Fallback silently to GEMINI_ACTIVE_MODELS
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
    GEMINI_ACTIVE_MODELS[0];

  const usingMock = isMock ?? isMockProvider;

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
        <span className="font-medium text-[11px] max-w-[130px] truncate">
          {activeOption.name}
        </span>
        {usingMock && (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/35">
            Mock
          </span>
        )}
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={12}
          className={`text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-64 rounded-xl bg-[#121417] border border-[rgba(255,255,255,0.1)] shadow-[0_12px_32px_rgba(0,0,0,0.6)] p-1.5 animate-in fade-in zoom-in-95 duration-150">
          {usingMock && (
            <div className="p-2 mb-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-200 leading-tight">
              ⚠️ <strong>Mock Mode Active:</strong> No active GEMINI_API_KEY detected in backend. Responses are simulated offline templates.
            </div>
          )}
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-[rgba(255,255,255,0.06)] mb-1 flex items-center justify-between">
            <span>Gemini Active Models</span>
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
