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
  isRefining: boolean;
  onTabChange: (tab: ResumeEditorTab) => void;
  onLatexChange: (latex: string) => void;
  onSaveLatex: () => Promise<void>;
  onRegenerate: () => Promise<void>;
  onRefineWithAgent: (instructions?: string) => Promise<void>;
}

const ResumeEditorContext = createContext<ResumeEditorContextValue | null>(null);

export interface ResumeEditorProviderProps {
  children: React.ReactNode;
  job: Job;
  resume: ResumeVersion;
  candidate: CandidateProfile | null;
  onRegenerate: () => Promise<void>;
  onRefineWithAgent?: (instructions?: string) => Promise<void>;
  onSaveCustomLatex?: (latex: string) => Promise<void>;
}

export function ResumeEditorProvider({
  children,
  job,
  resume,
  candidate,
  onRegenerate,
  onRefineWithAgent,
  onSaveCustomLatex,
}: ResumeEditorProviderProps) {
  const [activeTab, setActiveTab] = useState<ResumeEditorTab>("visual");
  const [editedLatex, setEditedLatex] = useState<string>(resume.latexSource);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);

  React.useEffect(() => {
    setEditedLatex(resume.latexSource);
  }, [resume.id, resume.latexSource]);

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

  const handleRefine = async (instructions?: string) => {
    if (!onRefineWithAgent) return;
    setIsRefining(true);
    try {
      await onRefineWithAgent(instructions);
    } finally {
      setIsRefining(false);
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
      isRefining,
      onTabChange: setActiveTab,
      onLatexChange: setEditedLatex,
      onSaveLatex: handleSave,
      onRegenerate: handleRegenerate,
      onRefineWithAgent: handleRefine,
    }),
    [
      job,
      resume,
      candidate,
      activeTab,
      editedLatex,
      isSaving,
      isRegenerating,
      isRefining,
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
    return {
      job: {
        id: "",
        title: "",
        company: "",
        url: "",
        location: "",
        source: "manual",
        description: "",
        status: "discovered",
        createdAt: "",
        updatedAt: "",
      },
      resume: {
        id: "",
        jobId: "",
        createdAt: "",
        versionNumber: 1,
        latexSource: "",
        diffItems: [],
        tailoredSummary: "",
        tailoredExperience: [],
      },
      candidate: null,
      activeTab: "visual",
      editedLatex: "",
      isSaving: false,
      isRegenerating: false,
      isRefining: false,
      onTabChange: () => {},
      onLatexChange: () => {},
      onSaveLatex: async () => {},
      onRegenerate: async () => {},
      onRefineWithAgent: async () => {},
    };
  }
  return context;
}
