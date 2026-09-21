"use client";

import type { CandidateProfile, Job, ResumeVersion } from "@resume-ai/types";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/apiClient";

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
}

const ResumeStudioContext = createContext<ResumeStudioContextValue | null>(null);

export interface ResumeStudioProviderProps {
  children: React.ReactNode;
  job: Job;
  resume: ResumeVersion;
  candidate: CandidateProfile | null;
  onRegenerate: () => Promise<void>;
  onRefineWithAgent?: (instructions?: string) => Promise<void>;
  onSaveCustomLatex?: (latex: string) => Promise<void>;
}

export function ResumeStudioProvider({
  children,
  job,
  resume: initialResume,
  candidate,
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

  const saveLatex = async () => {
    setIsSaving(true);
    try {
      if (onSaveCustomLatex) {
        await onSaveCustomLatex(editedLatex);
      } else {
        const res = await apiClient.saveResumeLatex(currentResume.id, editedLatex);
        setCurrentResume(res.version);
      }
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
      const element = document.getElementById("resume-document-sheet");
      if (!element) {
        window.print();
        return;
      }

      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const companySlug = job.company.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const filename = `resume-${companySlug}-v${currentResume.versionNumber}.pdf`;

      const options = {
        margin: [8, 8, 8, 8],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await (html2pdf as unknown as () => {
        set: (opt: unknown) => { from: (el: HTMLElement) => { save: () => Promise<void> } };
      })()
        .set(options)
        .from(element)
        .save();
    } catch {
      window.print();
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
      isDiffDrawerOpen,
      activeDiffKey,
      filterSection,
      isChatDrawerOpen,
      chatMessages,
      isRefining,
      isRegenerating,
      isExportingPdf,
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
