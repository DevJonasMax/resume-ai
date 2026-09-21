import type React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "destructive"
    | "success"
    | "indigo"
    | "purple"
    | "amber"
    | "sage"
    | "lavender"
    | "apricot"
    | "sky";
}

const badgeVariants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-zinc-200 text-zinc-900",
  secondary: "bg-[#181b1f] text-zinc-300 border border-[rgba(255,255,255,0.07)]",
  outline: "border border-[rgba(255,255,255,0.09)] text-zinc-400",
  destructive: "bg-red-950/40 text-red-300 border border-red-800/30",
  success: "bg-emerald-950/40 text-emerald-300 border border-emerald-800/30",
  indigo: "bg-indigo-950/40 text-indigo-300 border border-indigo-800/30",
  purple: "bg-purple-950/40 text-purple-300 border border-purple-800/30",
  amber: "bg-amber-950/40 text-amber-300 border border-amber-800/30",
  // OpenAI Prism Pastel Variants
  sage: "badge-sage",
  lavender: "badge-lavender",
  apricot: "badge-apricot",
  sky: "badge-sky",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}
