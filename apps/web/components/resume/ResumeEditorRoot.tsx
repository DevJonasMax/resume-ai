"use client";

import { ResumeEditorProvider, type ResumeEditorProviderProps } from "./ResumeEditorContext.js";

export interface ResumeEditorRootProps extends ResumeEditorProviderProps {
  className?: string;
}

export function ResumeEditorRoot({
  children,
  className = "",
  ...providerProps
}: ResumeEditorRootProps) {
  return (
    <ResumeEditorProvider {...providerProps}>
      <div className={`flex flex-col gap-5 w-full glass-panel rounded-2xl p-6 border border-zinc-800 ${className}`}>
        {children}
      </div>
    </ResumeEditorProvider>
  );
}
