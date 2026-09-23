"use client";

import type { CandidateProfile, Job, ResumeDocument, ResumeVersion } from "@resume-ai/types";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { compileLatexToPdf } from "@/lib/latexCompiler";

export type SplitMode = "split" | "latex" | "preview";
export type ZoomMode = "fit-width" | "fit-page" | "custom";
export type PDFProviderName = "typst" | "react-pdf" | "latex";

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

  // Provider state
  activeProvider: PDFProviderName;
  setActiveProvider: (provider: PDFProviderName) => void;

  // Split View state
  splitMode: SplitMode;
  setSplitMode: (mode: SplitMode) => void;

  // Zoom state
  zoomLevel: number;
  zoomMode: ZoomMode;
  setZoomLevel: (zoom: number | ((prev: number) => number)) => void;
  setZoomMode: (mode: ZoomMode) => void;

  // LaTeX / Structured editor state
  editedLatex: string;
  isLatexDirty: boolean;
  isSaving: boolean;
  setEditedLatex: (latex: string) => void;
  saveLatex: () => Promise<void>;
  saveDocument: (document: ResumeDocument) => Promise<void>;

  // Real PDF Compilation state
  pdfBlobUrl: string | null;
  pdfBlob: Blob | null;
  isCompilingPdf: boolean;
  compileError: string | null;
  compileLatex: (source?: string) => Promise<void>;
  compilePdf: (provider?: PDFProviderName) => Promise<void>;

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
  sendChatMessage: (prompt: string, modelOverride?: string) => Promise<void>;

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
  onRefineWithAgent?: (
    instructions?: string,
    model?: string
  ) => Promise<{
    version: ResumeVersion;
    thoughtProcess?: string | undefined;
    strategicDecisions?: string[] | undefined;
  } | void>;
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

  // Provider state
  const [activeProvider, setActiveProvider] = useState<PDFProviderName>("typst");

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

  // Load configured default provider from backend
  useEffect(() => {
    apiClient
      .getProviderConfig()
      .then((cfg) => {
        if (cfg?.activeProvider) {
          setActiveProvider(cfg.activeProvider);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCurrentResume(initialResume);
    setEditedLatex(initialResume.latexSource);
  }, [initialResume]);

  const isLatexDirty = editedLatex !== currentResume.latexSource;

  const compilePdf = useCallback(
    async (providerToUse?: PDFProviderName) => {
      const compileId = ++compileIdRef.current;
      setIsCompilingPdf(true);
      setCompileError(null);

      const targetProvider = providerToUse ?? activeProvider;

      try {
        const pdfUrl = apiClient.getResumePdfUrl(currentResume.id, { provider: targetProvider });
        const res = await fetch(pdfUrl);
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status} compiling PDF`);
        }
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);

        if (compileId !== compileIdRef.current) {
          URL.revokeObjectURL(objectUrl);
          return;
        }

        if (prevBlobUrlRef.current) {
          URL.revokeObjectURL(prevBlobUrlRef.current);
        }
        prevBlobUrlRef.current = objectUrl;

        setPdfBlobUrl(objectUrl);
        setPdfBlob(blob);
        setCompileError(null);
      } catch (err: unknown) {
        if (compileId !== compileIdRef.current) return;

        // Fallback to local in-browser WASM compiler if available
        try {
          if (editedLatex && editedLatex.trim()) {
            const fallbackResult = await compileLatexToPdf(editedLatex);
            setPdfBlobUrl(fallbackResult.pdfUrl);
            setPdfBlob(fallbackResult.pdfBlob);
            setCompileError(null);
            return;
          }
        } catch {
          // Keep primary error
        }

        const message = err instanceof Error ? err.message : String(err);
        setCompileError(message);
      } finally {
        if (compileId === compileIdRef.current) {
          setIsCompilingPdf(false);
        }
      }
    },
    [activeProvider, currentResume.id, editedLatex]
  );

  const compileLatex = useCallback(
    async (source?: string) => {
      if (source && source !== currentResume.latexSource) {
        try {
          const result = await compileLatexToPdf(source);
          setPdfBlobUrl(result.pdfUrl);
          setPdfBlob(result.pdfBlob);
          setCompileError(null);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          setCompileError(message);
        }
      } else {
        await compilePdf();
      }
    },
    [compilePdf, currentResume.latexSource]
  );

  // Initial and reactive PDF compilation
  useEffect(() => {
    compilePdf();
  }, [currentResume.id, activeProvider, compilePdf]);

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

  const saveDocument = async (document: ResumeDocument) => {
    setIsSaving(true);
    try {
      const res = await apiClient.saveResumeDocument(currentResume.id, document);
      setCurrentResume(res.version);
      await compilePdf();
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

  const sendChatMessage = async (prompt: string, modelOverride?: string) => {
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
      let thoughtProcess: string | undefined;
      let strategicDecisions: string[] | undefined;
      let newVersion: ResumeVersion = currentResume;

      if (onRefineWithAgent) {
        const refineRes = await onRefineWithAgent(trimmed, modelOverride);
        if (refineRes && "version" in refineRes) {
          newVersion = refineRes.version;
          thoughtProcess = refineRes.thoughtProcess;
          strategicDecisions = refineRes.strategicDecisions;
          setCurrentResume(refineRes.version);
          setEditedLatex(refineRes.version.latexSource);
        }
      } else {
        const res = await apiClient.refineResume(currentResume.id, trimmed, modelOverride);
        newVersion = res.version;
        thoughtProcess = res.thoughtProcess;
        strategicDecisions = res.strategicDecisions;
        setCurrentResume(res.version);
        setEditedLatex(res.version.latexSource);
      }

      const contentParts: string[] = [];

      if (thoughtProcess) {
        contentParts.push(`<thought>\n${thoughtProcess}\n</thought>`);
      }

      if (strategicDecisions && strategicDecisions.length > 0) {
        contentParts.push(
          `### 🎯 Strategic Decisions\n${strategicDecisions.map((d) => `• ${d}`).join("\n")}`
        );
      }

      if (newVersion.diffItems && newVersion.diffItems.length > 0) {
        contentParts.push(`### 🔄 ATS Tailoring & Content Changes`);
        for (const diff of newVersion.diffItems) {
          if (diff.originalText) {
            contentParts.push(`- ${diff.originalText}`);
          }
          if (diff.tailoredText) {
            contentParts.push(`+ ${diff.tailoredText}`);
          }
          if (diff.rationalization) {
            contentParts.push(`• *Reason*: ${diff.rationalization}`);
          }
        }
      }

      contentParts.push(
        `### 📊 ATS Impact & Readiness\nResume tailored for **${job.title}** at **${job.company}**. Document preview and code updated.`
      );

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: contentParts.join("\n\n"),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "system",
        content: message || "An unexpected error occurred while refining the resume.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
      throw err;
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
      activeProvider,
      setActiveProvider,
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
      saveDocument,
      pdfBlobUrl,
      pdfBlob,
      isCompilingPdf,
      compileError,
      compileLatex,
      compilePdf,
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
      activeProvider,
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
      compilePdf,
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
