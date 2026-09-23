import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Loading03Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

export type AiAvatarState = "idle" | "thinking" | "generating" | "error";

export interface AiAvatarProps {
  state?: AiAvatarState;
  size?: "sm" | "md" | "lg";
  className?: string;
  showStatusIndicator?: boolean;
}

const sizeClasses = {
  sm: {
    container: "w-6 h-6",
    iconSize: 12,
    indicator: "w-1.5 h-1.5 -bottom-0.5 -right-0.5",
  },
  md: {
    container: "w-8 h-8",
    iconSize: 15,
    indicator: "w-2 h-2 -bottom-0.5 -right-0.5",
  },
  lg: {
    container: "w-10 h-10",
    iconSize: 18,
    indicator: "w-2.5 h-2.5 -bottom-0.5 -right-0.5",
  },
};

/**
 * SmoothUI-inspired AI Avatar with animated ambient glow,
 * radial aura, and thinking/generating/error visual states.
 */
export function AiAvatar({
  state = "idle",
  size = "md",
  className = "",
  showStatusIndicator = true,
}: AiAvatarProps) {
  const currentSize = sizeClasses[size];

  // Glow aura styling based on state
  const getGlowStyles = () => {
    switch (state) {
      case "thinking":
        return "bg-gradient-to-tr from-[#93c5fd] via-[#d8b4fe] to-[#c084fc] opacity-75 blur-md animate-spin duration-[4000ms]";
      case "generating":
        return "bg-gradient-to-r from-[#a7f3d0] via-[#93c5fd] to-[#d8b4fe] opacity-80 blur-md animate-pulse";
      case "error":
        return "bg-rose-500 opacity-60 blur-md animate-pulse";
      case "idle":
      default:
        return "bg-[#d8b4fe] opacity-30 blur-sm group-hover:opacity-60 transition-opacity";
    }
  };

  // Center core container styling
  const getCoreStyles = () => {
    switch (state) {
      case "thinking":
        return "bg-[#1f192b] border-[#d8b4fe]/60 text-[#d8b4fe]";
      case "generating":
        return "bg-[#16212b] border-[#93c5fd]/70 text-[#93c5fd]";
      case "error":
        return "bg-[#291419] border-rose-500/60 text-rose-300";
      case "idle":
      default:
        return "bg-[#181b1f] border-[rgba(255,255,255,0.12)] text-[#d8b4fe]";
    }
  };

  // Status indicator dot
  const renderIndicator = () => {
    if (!showStatusIndicator) return null;

    if (state === "error") {
      return (
        <span
          className={`absolute ${currentSize.indicator} rounded-full bg-rose-500 ring-2 ring-[#121417] shadow-xs`}
          title="Error State"
        />
      );
    }

    if (state === "thinking" || state === "generating") {
      return (
        <span
          className={`absolute ${currentSize.indicator} rounded-full bg-[#93c5fd] ring-2 ring-[#121417] shadow-xs`}
          title={state === "thinking" ? "Thinking..." : "Generating..."}
        >
          <span className="absolute inset-0 rounded-full bg-[#93c5fd] animate-ping opacity-75" />
        </span>
      );
    }

    return (
      <span
        className={`absolute ${currentSize.indicator} rounded-full bg-[#a7f3d0] ring-2 ring-[#121417] shadow-xs`}
        title="AI Online"
      />
    );
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 group ${className}`}>
      {/* Outer Glow Aura */}
      <div className={`absolute -inset-0.5 rounded-full ${getGlowStyles()}`} />

      {/* Inner Avatar Bubble */}
      <div
        className={`relative ${currentSize.container} rounded-full flex items-center justify-center border shadow-md transition-colors duration-200 ${getCoreStyles()}`}
      >
        {state === "error" ? (
          <HugeiconsIcon icon={Alert02Icon} size={currentSize.iconSize} className="shrink-0" />
        ) : state === "thinking" ? (
          <HugeiconsIcon
            icon={Loading03Icon}
            size={currentSize.iconSize}
            className="animate-spin shrink-0"
          />
        ) : state === "generating" ? (
          <HugeiconsIcon
            icon={SparklesIcon}
            size={currentSize.iconSize}
            className="animate-pulse shrink-0 text-[#93c5fd]"
          />
        ) : (
          <HugeiconsIcon
            icon={SparklesIcon}
            size={currentSize.iconSize}
            className="group-hover:rotate-12 transition-transform duration-300 shrink-0"
          />
        )}
      </div>

      {/* Online / State Dot Indicator */}
      {renderIndicator()}
    </div>
  );
}
