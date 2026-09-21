"use client";

import {
  Bot,
  Building2,
  Columns2,
  Download,
  FileCode,
  FileDiff,
  FileDown,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useResumeStudio } from "./ResumeStudioContext";

export function ResumeStudioHeader() {
  const {
    job,
    resume,
    splitMode,
    setSplitMode,
    isRegenerating,
    regenerateResume,
    openDiffDrawer,
    openChatDrawer,
    exportPdf,
    isExportingPdf,
    downloadTex,
  } = useResumeStudio();

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-zinc-950/90 border border-zinc-800/80 rounded-xl">
      {/* Left side: Job & Version information */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white tracking-tight">
              {job.title}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1 text-xs text-zinc-300 font-medium">
              <Building2 className="w-3.5 h-3.5 text-zinc-500" />
              {job.company}
            </span>
            <Badge variant="indigo">v{resume.versionNumber}</Badge>
            <Badge variant="outline" className="text-[10px] text-zinc-400 uppercase">
              {job.status.replace("_", " ")}
            </Badge>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono mt-0.5">
            ATS LaTeX Synthesis • {resume.diffItems?.length ?? 0} aligned tailoring criteria
          </span>
        </div>
      </div>

      {/* Middle & Right: Layout controls and Actions */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* 50/50 Split layout switcher */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setSplitMode("latex")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              splitMode === "latex"
                ? "bg-zinc-800 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title="LaTeX Code Editor Only"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Code</span>
          </button>

          <button
            type="button"
            onClick={() => setSplitMode("split")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              splitMode === "split"
                ? "bg-zinc-800 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title="50/50 Split Workspace"
          >
            <Columns2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Split 50/50</span>
          </button>

          <button
            type="button"
            onClick={() => setSplitMode("preview")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              splitMode === "preview"
                ? "bg-zinc-800 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title="PDF Document Preview Only"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>

        {/* ATS Diffs Drawer trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={openDiffDrawer}
          className="gap-1.5 text-xs border-zinc-800 text-zinc-300 hover:text-white"
        >
          <FileDiff className="w-3.5 h-3.5 text-purple-400" />
          <span>ATS Diffs</span>
          <span className="px-1.5 py-0.2 bg-purple-950/80 text-purple-300 rounded font-mono text-[10px] border border-purple-800/40">
            {resume.diffItems?.length ?? 0}
          </span>
        </Button>

        {/* AI Agent Chat trigger */}
        <Button
          variant="purple"
          size="sm"
          onClick={openChatDrawer}
          className="gap-1.5 text-xs font-semibold"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Agent Dialogue</span>
        </Button>

        {/* Regenerate Button */}
        <Button
          variant="secondary"
          size="icon"
          onClick={regenerateResume}
          disabled={isRegenerating}
          title="Regenerate ATS Resume"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
        </Button>

        {/* Download Tex Source */}
        <Button
          variant="secondary"
          size="icon"
          onClick={downloadTex}
          title="Download LaTeX (.tex)"
        >
          <FileDown className="w-3.5 h-3.5 text-zinc-400" />
        </Button>

        {/* Download PDF via html2pdf.js */}
        <Button
          variant="indigo"
          size="sm"
          onClick={exportPdf}
          disabled={isExportingPdf}
          className="gap-1.5 text-xs"
        >
          <Download className={`w-3.5 h-3.5 ${isExportingPdf ? "animate-bounce" : ""}`} />
          <span>{isExportingPdf ? "Exporting..." : "Download PDF"}</span>
        </Button>
      </div>
    </header>
  );
}
