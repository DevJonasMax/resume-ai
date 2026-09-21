"use client";

import type React from "react";
import { useResumeStudio } from "./ResumeStudioContext";
import { ResumeStudioLatexEditor } from "./ResumeStudioLatexEditor";
import { ResumeStudioPdfPreview } from "./ResumeStudioPdfPreview";

export interface ResumeStudioSplitViewProps {
  children?: React.ReactNode;
}

export function ResumeStudioSplitView({ children }: ResumeStudioSplitViewProps) {
  const { splitMode } = useResumeStudio();

  if (children) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div className="w-full">
      {splitMode === "split" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <div className="w-full min-w-0">
            <ResumeStudioLatexEditor />
          </div>
          <div className="w-full min-w-0">
            <ResumeStudioPdfPreview />
          </div>
        </div>
      )}

      {splitMode === "latex" && (
        <div className="w-full max-w-5xl mx-auto">
          <ResumeStudioLatexEditor />
        </div>
      )}

      {splitMode === "preview" && (
        <div className="w-full max-w-5xl mx-auto">
          <ResumeStudioPdfPreview />
        </div>
      )}
    </div>
  );
}
