import type React from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <div className="relative group inline-flex items-center">
      {children}
      <div
        role="tooltip"
        className={cn(
          "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center px-2 py-1 text-[11px] font-medium text-white bg-zinc-900 border border-zinc-700/80 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none transition-opacity",
          className
        )}
      >
        {content}
      </div>
    </div>
  );
}
