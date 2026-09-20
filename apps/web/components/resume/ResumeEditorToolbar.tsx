import { Code2, Download, Eye, FileDiff, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { type ResumeEditorTab, useResumeEditor } from "./ResumeEditorContext.js";

export function ResumeEditorToolbar() {
  const { resume, job, activeTab, onTabChange, isRegenerating, onRegenerate } = useResumeEditor();

  const handleDownload = () => {
    const blob = new Blob([resume.latexSource], { type: "text/x-tex;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resume-${job.company.toLowerCase().replace(/\s+/g, "-")}-v${resume.versionNumber}.tex`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabs: Array<{ id: ResumeEditorTab; label: string; icon: ReactNode }> = [
    { id: "visual", label: "Document Preview", icon: <Eye className="w-4 h-4" /> },
    { id: "diffs", label: `Tailoring Diffs (${resume.diffItems.length})`, icon: <FileDiff className="w-4 h-4" /> },
    { id: "latex", label: "LaTeX Source", icon: <Code2 className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
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

      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
          <span>{isRegenerating ? "Re-tailoring..." : "Re-tailor with AI"}</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download .tex</span>
        </button>
      </div>
    </div>
  );
}
