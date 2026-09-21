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
    | "purple";
  size?: "default" | "sm" | "lg" | "icon";
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 shadow-sm",
  destructive: "bg-red-600 text-white hover:bg-red-500 shadow-sm",
  outline: "border border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white",
  secondary: "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 shadow-sm",
  ghost: "text-zinc-400 hover:text-white hover:bg-zinc-850",
  link: "text-indigo-400 underline-offset-4 hover:underline p-0 h-auto",
  indigo: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/20",
  purple: "bg-purple-600 text-white hover:bg-purple-500 shadow-sm shadow-purple-600/20",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-9 px-4 py-2 text-xs",
  sm: "h-7 px-2.5 text-[11px]",
  lg: "h-10 px-6 text-sm",
  icon: "h-8 w-8 p-0",
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
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
