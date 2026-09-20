"use client";

import type { CandidateProfile, Job, ResumeVersion } from "@resume-ai/types";
import React, { createContext, useContext, useMemo, useState } from "react";

export type ResumeEditorTab = "visual" | "diffs" | "latex";

export interface ResumeEditorContextValue {
  job: Job;
  resume: ResumeVersion;
  candidate: CandidateProfile | null;
  activeTab: ResumeEditorTab;
  editedLatex: string;
  isSaving: boolean;
  isRegenerating: boolean;
  onTabChange: (tab: ResumeEditorTab) => void;
  onLatexChange: (latex: string) => void;
  onSaveLatex: () => Promise<void>;
  onRegenerate: () => Promise<void>;
}

const ResumeEditorContext = createContext<ResumeEditorContextValue | null>(null);

export interface ResumeEditorProviderProps {
  children: React.ReactNode;
  job: Job;
  resume: ResumeVersion;
  candidate: CandidateProfile | null;
  onRegenerate: () => Promise<void>;
  onSaveCustomLatex?: (latex: string) => Promise<void>;
}

export function ResumeEditorProvider({
  children,
  job,
  resume,
  candidate,
  onRegenerate,
  onSaveCustomLatex,
}: ResumeEditorProviderProps) {
  const [activeTab, setActiveTab] = useState<ResumeEditorTab>("visual");
  const [editedLatex, setEditedLatex] = useState<string>(resume.latexSource);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  const handleSave = async () => {
    if (!onSaveCustomLatex) return;
    setIsSaving(true);
    try {
      await onSaveCustomLatex(editedLatex);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  };

  const value = useMemo<ResumeEditorContextValue>(
    () => ({
      job,
      resume,
      candidate,
      activeTab,
      editedLatex,
      isSaving,
      isRegenerating,
      onTabChange: setActiveTab,
      onLatexChange: setEditedLatex,
      onSaveLatex: handleSave,
      onRegenerate: handleRegenerate,
    }),
    [
      job,
      resume,
      candidate,
      activeTab,
      editedLatex,
      isSaving,
      isRegenerating,
    ]
  );

  return (
    <ResumeEditorContext.Provider value={value}>
      {children}
    </ResumeEditorContext.Provider>
  );
}

export function useResumeEditor(): ResumeEditorContextValue {
  const context = useContext(ResumeEditorContext);
  if (!context) {
    throw new Error("useResumeEditor must be used within a ResumeEditorProvider");
  }
  return context;
}
