"use client";

import { Code2, Download, Eye, FileDiff, FileDown, RefreshCw, Sparkles } from "lucide-react";
import { type ReactNode, useState } from "react";
import { type ResumeEditorTab, useResumeEditor } from "./ResumeEditorContext.js";

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
      const element = document.getElementById("resume-document-sheet");
      if (!element) {
        window.print();
        return;
      }

      // Dynamically load html2pdf in client environment
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const companySlug = job.company.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const filename = `resume-${companySlug}-v${resume.versionNumber}.pdf`;

      const options = {
        margin: [10, 10, 10, 10],
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
    { id: "visual", label: "Document Preview", icon: <Eye className="w-4 h-4" /> },
    { id: "diffs", label: `Tailoring Diffs (${resume.diffItems.length})`, icon: <FileDiff className="w-4 h-4" /> },
    { id: "latex", label: "LaTeX Source", icon: <Code2 className="w-4 h-4" /> },
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

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowRefinePrompt((prev) => !prev)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 text-xs font-semibold rounded-lg border border-purple-700/50 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Agent Refine</span>
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>{isRegenerating ? "Tailoring..." : "Re-tailor"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTex}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg border border-zinc-700 transition-all cursor-pointer"
            title="Download LaTeX Source"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.tex</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <FileDown className={`w-4 h-4 ${isDownloadingPdf ? "animate-bounce" : ""}`} />
            <span>{isDownloadingPdf ? "Generating PDF..." : "Download PDF"}</span>
          </button>
        </div>
      </div>

      {/* Optional Agent Refinement Prompt Drawer */}
      {showRefinePrompt && (
        <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl flex flex-col sm:flex-row items-center gap-2 animate-in fade-in duration-200">
          <input
            type="text"
            placeholder="e.g. Emphasize Playwright, cloud scaling metrics, and lead responsibilities..."
            value={refineInstructions}
            onChange={(e) => setRefineInstructions(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExecuteRefine()}
            className="flex-1 w-full bg-zinc-900 border border-purple-700/40 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-400"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExecuteRefine}
              disabled={isRefining}
              className="flex-1 sm:flex-none px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {isRefining ? "Refining..." : "Optimize with Agent"}
            </button>
            <button
              type="button"
              onClick={() => setShowRefinePrompt(false)}
              className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
