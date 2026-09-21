import type React from "react";
import { cn } from "@/lib/utils";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: string | number;
}

export function ScrollArea({
  className,
  style,
  children,
  maxHeight,
  ...props
}: ScrollAreaProps) {
  return (
    <div
      className={cn("overflow-y-auto overflow-x-hidden", className)}
      style={{ maxHeight, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
