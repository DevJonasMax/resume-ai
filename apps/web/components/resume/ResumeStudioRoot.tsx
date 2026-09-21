"use client";

import type { ReactNode } from "react";
import { ResumeStudioProvider, type ResumeStudioProviderProps } from "./ResumeStudioContext";

export interface ResumeStudioRootProps extends ResumeStudioProviderProps {
  className?: string;
  children: ReactNode;
}

export function ResumeStudioRoot({
  children,
  className,
  ...providerProps
}: ResumeStudioRootProps) {
  return (
    <ResumeStudioProvider {...providerProps}>
      <div className={`flex flex-col gap-4 w-full ${className || ""}`}>
        {children}
      </div>
    </ResumeStudioProvider>
  );
}
