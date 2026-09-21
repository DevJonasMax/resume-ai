"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Download01Icon,
  EyeIcon,
  FileCodeIcon,
  FileDownloadIcon,
  ReloadIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { type ReactNode, useState } from "react";
import { type ResumeEditorTab, useResumeEditor } from "./ResumeEditorContext.js";

import { compileLatexToPdf } from "@/lib/latexCompiler";

export function ResumeEditorToolbar() {
  const {
    resume,
    job,
    activeTab,
    onTabChange,
    isRegenerating,
    isRefining,
    onRegenerate,
    onRefineWithAgent,
  } = useResumeEditor();

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showRefinePrompt, setShowRefinePrompt] = useState(false);
  const [refineInstructions, setRefineInstructions] = useState("");

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const { pdfBlob } = await compileLatexToPdf(resume.latexSource);
      const url = URL.createObjectURL(pdfBlob);
      const companySlug = job.company.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const filename = `resume-${companySlug}-v${resume.versionNumber}.pdf`;

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadTex = () => {
    const blob = new Blob([resume.latexSource], { type: "text/x-tex;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const companySlug = job.company.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.download = `resume-${companySlug}-v${resume.versionNumber}.tex`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExecuteRefine = async () => {
    await onRefineWithAgent(refineInstructions.trim() || undefined);
    setShowRefinePrompt(false);
    setRefineInstructions("");
  };

  const tabs: Array<{ id: ResumeEditorTab; label: string; icon: ReactNode }> = [
    { id: "visual", label: "Document Preview", icon: <HugeiconsIcon icon={EyeIcon} size={16} /> },
    { id: "diffs", label: `Tailoring Diffs (${resume.diffItems.length})`, icon: <HugeiconsIcon icon={FileCodeIcon} size={16} /> },
    { id: "latex", label: "LaTeX Source", icon: <HugeiconsIcon icon={FileCodeIcon} size={16} /> },
  ];

  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-zinc-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRefinePrompt((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 rounded-lg text-xs font-semibold border border-purple-800/60 transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={SparklesIcon} size={14} className="text-purple-400" />
            <span>Refine Prompt</span>
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Regenerate from Profile Truth"
          >
            <HugeiconsIcon icon={ReloadIcon} size={16} className={isRegenerating ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={handleDownloadTex}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Download .tex Source"
          >
            <HugeiconsIcon icon={FileDownloadIcon} size={16} />
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <HugeiconsIcon icon={Download01Icon} size={14} />
            <span>{isDownloadingPdf ? "Exporting PDF..." : "Export PDF"}</span>
          </button>
        </div>
      </div>

      {/* Refinement Prompt Drawer */}
      {showRefinePrompt && (
        <div className="p-4 bg-zinc-900/90 rounded-xl border border-zinc-700 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-150">
          <span className="text-xs font-semibold text-zinc-300">Agent LaTeX Refinement Instructions:</span>
          <textarea
            rows={2}
            value={refineInstructions}
            onChange={(e) => setRefineInstructions(e.target.value)}
            placeholder="e.g. Highlight distributed systems leadership and condense summary to 3 punchy bullet points..."
            className="w-full bg-zinc-950 p-2.5 rounded-lg border border-zinc-700 text-xs text-zinc-200 outline-none focus:border-indigo-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowRefinePrompt(false)}
              className="px-3 py-1 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteRefine}
              disabled={isRefining}
              className="px-3.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {isRefining ? "Refining with AI..." : "Execute Refine"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
