import type React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "indigo"
    | "purple"
    | "sage"
    | "lavender"
    | "apricot"
    | "sky";
  size?: "default" | "sm" | "lg" | "icon";
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-[#ededed] text-[#0c0d0e] hover:bg-white hover:shadow-[0_0_14px_rgba(255,255,255,0.25)] shadow-sm font-semibold",
  destructive:
    "bg-red-950/60 text-red-300 border border-red-800/40 hover:bg-red-900/60 hover:shadow-[0_0_12px_rgba(244,63,94,0.2)]",
  outline:
    "border border-[rgba(255,255,255,0.08)] bg-transparent text-zinc-300 hover:bg-[#181b1f] hover:text-white hover:border-[rgba(255,255,255,0.16)]",
  secondary:
    "bg-[#181b1f] text-zinc-200 border border-[rgba(255,255,255,0.07)] hover:bg-[#20242a] hover:border-[rgba(255,255,255,0.15)]",
  ghost: "text-zinc-400 hover:text-white hover:bg-[#181b1f]",
  link: "text-[#93c5fd] underline-offset-4 hover:underline p-0 h-auto",
  indigo:
    "bg-[#1d2232] text-[#93c5fd] border border-[#93c5fd]/30 hover:bg-[#252c42] hover:border-[#93c5fd]/50 hover:shadow-[0_0_12px_rgba(147,197,253,0.15)]",
  purple:
    "bg-[#271d34] text-[#d8b4fe] border border-[#d8b4fe]/30 hover:bg-[#342646] hover:border-[#d8b4fe]/50 hover:shadow-[0_0_12px_rgba(216,180,254,0.15)]",
  // OpenAI Prism Pastel Buttons
  sage: "bg-[#142820] text-[#a7f3d0] border border-[#a7f3d0]/30 hover:bg-[#1a342a] hover:border-[#a7f3d0]/50 hover:shadow-[0_0_12px_rgba(167,243,208,0.18)]",
  lavender:
    "bg-[#251e33] text-[#d8b4fe] border border-[#d8b4fe]/30 hover:bg-[#312744] hover:border-[#d8b4fe]/50 hover:shadow-[0_0_12px_rgba(216,180,254,0.18)]",
  apricot:
    "bg-[#2e1d13] text-[#fdba74] border border-[#fdba74]/30 hover:bg-[#3a2518] hover:border-[#fdba74]/50 hover:shadow-[0_0_12px_rgba(253,186,116,0.18)]",
  sky: "bg-[#142233] text-[#93c5fd] border border-[#93c5fd]/30 hover:bg-[#1a2d44] hover:border-[#93c5fd]/50 hover:shadow-[0_0_12px_rgba(147,197,253,0.18)]",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-8.5 px-3.5 py-1.5 text-xs",
  sm: "h-7 px-2.5 text-[11px]",
  lg: "h-10 px-5 text-sm",
  icon: "h-7.5 w-7.5 p-0",
};

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 active:scale-95 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-40 disabled:active:scale-100",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
