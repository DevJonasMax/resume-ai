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
    | "amber";
}

const badgeVariants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-zinc-100 text-zinc-900",
  secondary: "bg-zinc-800 text-zinc-300 border border-zinc-700/60",
  outline: "border border-zinc-800 text-zinc-400",
  destructive: "bg-red-950/60 text-red-300 border border-red-800/40",
  success: "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40",
  indigo: "bg-indigo-950/60 text-indigo-300 border border-indigo-800/40",
  purple: "bg-purple-950/60 text-purple-300 border border-purple-800/40",
  amber: "bg-amber-950/60 text-amber-300 border border-amber-800/40",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}
