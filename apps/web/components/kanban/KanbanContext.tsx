"use client";

import type { Job, JobStatus } from "@resume-ai/types";
import { createContext, useContext, useMemo } from "react";

export interface KanbanContextValue {
  jobs: Job[];
  selectedJobId: string | null;
  searchQuery: string;
  onSelectJob: (job: Job) => void;
  onMoveJob: (jobId: string, targetStatus: JobStatus) => Promise<void>;
  onAnalyzeJob: (job: Job) => void;
  onOpenResume: (job: Job) => void;
  onApplyJob: (job: Job) => void;
  onSearchChange: (query: string) => void;
}

const KanbanContext = createContext<KanbanContextValue | null>(null);

export interface KanbanProviderProps {
  children: React.ReactNode;
  jobs: Job[];
  selectedJobId?: string | null;
  searchQuery?: string;
  onSelectJob: (job: Job) => void;
  onMoveJob: (jobId: string, targetStatus: JobStatus) => Promise<void>;
  onAnalyzeJob: (job: Job) => void;
  onOpenResume: (job: Job) => void;
  onApplyJob: (job: Job) => void;
  onSearchChange: (query: string) => void;
}

export function KanbanProvider({
  children,
  jobs,
  selectedJobId = null,
  searchQuery = "",
  onSelectJob,
  onMoveJob,
  onAnalyzeJob,
  onOpenResume,
  onApplyJob,
  onSearchChange,
}: KanbanProviderProps) {
  const value = useMemo<KanbanContextValue>(
    () => ({
      jobs,
      selectedJobId,
      searchQuery,
      onSelectJob,
      onMoveJob,
      onAnalyzeJob,
      onOpenResume,
      onApplyJob,
      onSearchChange,
    }),
    [
      jobs,
      selectedJobId,
      searchQuery,
      onSelectJob,
      onMoveJob,
      onAnalyzeJob,
      onOpenResume,
      onApplyJob,
      onSearchChange,
    ]
  );

  return <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>;
}

export function useKanban(): KanbanContextValue {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error("useKanban must be used within a KanbanProvider");
  }
  return context;
}
