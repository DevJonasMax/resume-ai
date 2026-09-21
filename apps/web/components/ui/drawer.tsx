"use client";

import type React from "react";
import { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  side?: "left" | "right" | "bottom";
  className?: string;
  widthClass?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = "right",
  className,
  widthClass = "max-w-xl",
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sideAnimation =
    side === "right"
      ? "animate-in slide-in-from-right duration-200"
      : side === "left"
        ? "animate-in slide-in-from-left duration-200"
        : "animate-in slide-in-from-bottom duration-200";

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        className={cn(
          "fixed z-50 flex flex-col bg-[#121417] border-[rgba(255,255,255,0.08)] shadow-2xl h-full",
          side === "right" && "right-0 top-0 bottom-0 border-l w-full",
          side === "left" && "left-0 top-0 bottom-0 border-r w-full",
          side === "bottom" && "bottom-0 left-0 right-0 border-t max-h-[85vh]",
          side !== "bottom" && widthClass,
          sideAnimation,
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-[rgba(255,255,255,0.06)] bg-[#181b1f]/60">
          <div className="flex flex-col gap-0.5">
            {title && <h2 className="text-sm font-semibold text-white">{title}</h2>}
            {description && (
              <p className="text-xs text-zinc-400">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#1e2228] transition-colors cursor-pointer"
            aria-label="Close panel"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
