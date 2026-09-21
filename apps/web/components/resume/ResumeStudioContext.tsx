"use client";

import type { CandidateProfile, Job, ResumeVersion } from "@resume-ai/types";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { compileLatexToPdf } from "@/lib/latexCompiler";

export type SplitMode = "split" | "latex" | "preview";
export type ZoomMode = "fit-width" | "fit-page" | "custom";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface ResumeStudioContextValue {
  job: Job;
  resume: ResumeVersion;
  candidate: CandidateProfile | null;

  // Split View state
  splitMode: SplitMode;
  setSplitMode: (mode: SplitMode) => void;

  // Zoom state
  zoomLevel: number;
  zoomMode: ZoomMode;
  setZoomLevel: (zoom: number | ((prev: number) => number)) => void;
  setZoomMode: (mode: ZoomMode) => void;

  // LaTeX editor state
  editedLatex: string;
  isLatexDirty: boolean;
  isSaving: boolean;
  setEditedLatex: (latex: string) => void;
  saveLatex: () => Promise<void>;

  // Real PDF Compilation state
  pdfBlobUrl: string | null;
  pdfBlob: Blob | null;
  isCompilingPdf: boolean;
  compileError: string | null;
  compileLatex: (source?: string) => Promise<void>;

  // Diff Inspector state
  isDiffDrawerOpen: boolean;
  openDiffDrawer: () => void;
  closeDiffDrawer: () => void;
  toggleDiffDrawer: () => void;
  activeDiffKey: string | null;
  setActiveDiffKey: (key: string | null) => void;
  filterSection: string;
  setFilterSection: (section: string) => void;

  // AI Conversation (SmoothUI) state
  isChatDrawerOpen: boolean;
  openChatDrawer: () => void;
  closeChatDrawer: () => void;
  toggleChatDrawer: () => void;
  chatMessages: ChatMessage[];
  isRefining: boolean;
  sendChatMessage: (prompt: string) => Promise<void>;

  // Regeneration
  isRegenerating: boolean;
  regenerateResume: () => Promise<void>;

  // Export
  isExportingPdf: boolean;
  exportPdf: () => Promise<void>;
  downloadTex: () => void;

  // In-studio selectors
  allJobs: Job[];
  allCandidates: CandidateProfile[];
  onSelectJob?: (job: Job) => Promise<void>;
  onSelectCandidate?: (candidate: CandidateProfile) => void;
}

const g = globalThis as unknown as {
  __resume_studio_context?: React.Context<ResumeStudioContextValue | null>;
};
export const ResumeStudioContext = (g.__resume_studio_context ??=
  createContext<ResumeStudioContextValue | null>(null));

export interface ResumeStudioProviderProps {
  children: React.ReactNode;
  job: Job;
  resume: ResumeVersion;
  candidate: CandidateProfile | null;
  allJobs?: Job[];
  allCandidates?: CandidateProfile[];
  onSelectJob?: (job: Job) => Promise<void>;
  onSelectCandidate?: (candidate: CandidateProfile) => void;
  onRegenerate: () => Promise<void>;
  onRefineWithAgent?: (instructions?: string) => Promise<void>;
  onSaveCustomLatex?: (latex: string) => Promise<void>;
}

export function ResumeStudioProvider({
  children,
  job,
  resume: initialResume,
  candidate,
  allJobs = [],
  allCandidates = [],
  onSelectJob,
  onSelectCandidate,
  onRegenerate,
  onRefineWithAgent,
  onSaveCustomLatex,
}: ResumeStudioProviderProps) {
  const [currentResume, setCurrentResume] = useState<ResumeVersion>(initialResume);
  const [splitMode, setSplitMode] = useState<SplitMode>("split");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [zoomMode, setZoomMode] = useState<ZoomMode>("custom");

  const [editedLatex, setEditedLatex] = useState<string>(initialResume.latexSource);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // PDF compilation state
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isCompilingPdf, setIsCompilingPdf] = useState<boolean>(false);
  const [compileError, setCompileError] = useState<string | null>(null);

  const prevBlobUrlRef = useRef<string | null>(null);
  const compileIdRef = useRef<number>(0);

  const [isDiffDrawerOpen, setIsDiffDrawerOpen] = useState<boolean>(false);
  const [activeDiffKey, setActiveDiffKey] = useState<string | null>(null);
  const [filterSection, setFilterSection] = useState<string>("all");

  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "initial-agent-msg",
      role: "assistant",
      content: `I have tailored your resume for **${job.title}** at **${job.company}**. ${
        initialResume.diffItems?.length ?? 0
      } targeted ATS modifications were synthesized based on the requirements. How would you like to refine it further?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  useEffect(() => {
    setCurrentResume(initialResume);
    setEditedLatex(initialResume.latexSource);
  }, [initialResume]);

  const isLatexDirty = editedLatex !== currentResume.latexSource;

  const compileLatex = useCallback(async (source?: string) => {
    const latexToCompile = source ?? editedLatex;
    if (!latexToCompile || !latexToCompile.trim()) return;

    const compileId = ++compileIdRef.current;
    setIsCompilingPdf(true);
    setCompileError(null);

    try {
      const result = await compileLatexToPdf(latexToCompile);

      if (compileId !== compileIdRef.current) {
        URL.revokeObjectURL(result.pdfUrl);
        return;
      }

      if (prevBlobUrlRef.current) {
        URL.revokeObjectURL(prevBlobUrlRef.current);
      }
      prevBlobUrlRef.current = result.pdfUrl;

      setPdfBlobUrl(result.pdfUrl);
      setPdfBlob(result.pdfBlob);
      setCompileError(null);
    } catch (err: unknown) {
      if (compileId !== compileIdRef.current) {
        return;
      }
      const message = err instanceof Error ? err.message : String(err);
      setCompileError(message);
    } finally {
      if (compileId === compileIdRef.current) {
        setIsCompilingPdf(false);
      }
    }
  }, [editedLatex]);

  // Debounced compilation when editedLatex changes
  useEffect(() => {
    const timer = setTimeout(() => {
      compileLatex(editedLatex);
    }, 600);

    return () => clearTimeout(timer);
  }, [editedLatex, compileLatex]);

  // Revoke object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) {
        URL.revokeObjectURL(prevBlobUrlRef.current);
        prevBlobUrlRef.current = null;
      }
    };
  }, []);

  const saveLatex = async () => {
    setIsSaving(true);
    try {
      if (onSaveCustomLatex) {
        await onSaveCustomLatex(editedLatex);
      } else {
        const res = await apiClient.saveResumeLatex(currentResume.id, editedLatex);
        setCurrentResume(res.version);
      }
      await compileLatex(editedLatex);
    } finally {
      setIsSaving(false);
    }
  };

  const regenerateResume = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  };

  const sendChatMessage = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsRefining(true);

    try {
      if (onRefineWithAgent) {
        await onRefineWithAgent(trimmed);
      } else {
        const res = await apiClient.refineResume(currentResume.id, trimmed);
        setCurrentResume(res.version);
        setEditedLatex(res.version.latexSource);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `I've updated the LaTeX code and document preview according to your instructions: "${trimmed}". ATS tailoring alignments and diffs have been refreshed.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "system",
        content: "An error occurred while refining the resume. Please check your connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsRefining(false);
    }
  };

  const exportPdf = async () => {
    setIsExportingPdf(true);
    try {
      let downloadUrl = pdfBlobUrl;

      if (!downloadUrl) {
        const result = await compileLatexToPdf(editedLatex);
        if (prevBlobUrlRef.current) {
          URL.revokeObjectURL(prevBlobUrlRef.current);
        }
        prevBlobUrlRef.current = result.pdfUrl;
        setPdfBlobUrl(result.pdfUrl);
        setPdfBlob(result.pdfBlob);
        downloadUrl = result.pdfUrl;
      }

      const companySlug = job.company.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const filename = `resume-${companySlug}-v${currentResume.versionNumber}.pdf`;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setCompileError(message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const downloadTex = () => {
    const blob = new Blob([editedLatex], { type: "text/x-tex;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const companySlug = job.company.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.download = `resume-${companySlug}-v${currentResume.versionNumber}.tex`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const value = useMemo<ResumeStudioContextValue>(
    () => ({
      job,
      resume: currentResume,
      candidate,
      splitMode,
      setSplitMode,
      zoomLevel,
      zoomMode,
      setZoomLevel,
      setZoomMode,
      editedLatex,
      isLatexDirty,
      isSaving,
      setEditedLatex,
      saveLatex,
      pdfBlobUrl,
      pdfBlob,
      isCompilingPdf,
      compileError,
      compileLatex,
      isDiffDrawerOpen,
      openDiffDrawer: () => setIsDiffDrawerOpen(true),
      closeDiffDrawer: () => setIsDiffDrawerOpen(false),
      toggleDiffDrawer: () => setIsDiffDrawerOpen((prev) => !prev),
      activeDiffKey,
      setActiveDiffKey,
      filterSection,
      setFilterSection,
      isChatDrawerOpen,
      openChatDrawer: () => setIsChatDrawerOpen(true),
      closeChatDrawer: () => setIsChatDrawerOpen(false),
      toggleChatDrawer: () => setIsChatDrawerOpen((prev) => !prev),
      chatMessages,
      isRefining,
      sendChatMessage,
      isRegenerating,
      regenerateResume,
      isExportingPdf,
      exportPdf,
      downloadTex,
      allJobs,
      allCandidates,
      onSelectJob,
      onSelectCandidate,
    }),
    [
      job,
      currentResume,
      candidate,
      splitMode,
      zoomLevel,
      zoomMode,
      editedLatex,
      isLatexDirty,
      isSaving,
      pdfBlobUrl,
      pdfBlob,
      isCompilingPdf,
      compileError,
      compileLatex,
      isDiffDrawerOpen,
      activeDiffKey,
      filterSection,
      isChatDrawerOpen,
      chatMessages,
      isRefining,
      isRegenerating,
      isExportingPdf,
      allJobs,
      allCandidates,
      onSelectJob,
      onSelectCandidate,
    ]
  );

  return (
    <ResumeStudioContext.Provider value={value}>
      {children}
    </ResumeStudioContext.Provider>
  );
}

export function useResumeStudio(): ResumeStudioContextValue {
  const context = useContext(ResumeStudioContext);
  if (!context) {
    throw new Error("useResumeStudio must be used within a ResumeStudioProvider");
  }
  return context;
}
