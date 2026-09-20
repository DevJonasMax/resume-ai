import type { Job, ResumeVersion } from "@resume-ai/types";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  FileCode,
  FileText,
  History,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import React, { useState } from "react";

interface ResumeEditorProps {
  job: Job;
  resumeVersion: ResumeVersion | null;
  onBack: () => void;
  onRegenerate: () => Promise<void>;
  onApply: () => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  job,
  resumeVersion,
  onBack,
  onRegenerate,
  onApply,
}) => {
  const [activeView, setActiveView] = useState<"structured" | "latex" | "diff">("structured");
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleCopyLatex = async () => {
    if (resumeVersion?.latexSource) {
      await navigator.clipboard.writeText(resumeVersion.latexSource);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadLatex = () => {
    if (!resumeVersion?.latexSource) return;
    const blob = new Blob([resumeVersion.latexSource], { type: "text/x-tex" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${job.company.replace(/\s+/g, "_")}_Tailored_Resume.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRegenerateClick = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!resumeVersion) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-zinc-900/30 rounded-xl border border-zinc-800">
        <FileText className="w-12 h-12 text-zinc-600 mb-3" />
        <h3 className="text-lg font-semibold text-zinc-200 mb-1">No Tailored Resume Generated Yet</h3>
        <p className="text-sm text-zinc-400 max-w-md mb-6">
          Generate an ATS-optimized, grounded LaTeX resume tailored to the requirements of {job.title} at {job.company}.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg text-xs font-medium border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Go Back
          </button>
          <button
            onClick={handleRegenerateClick}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
          >
            <Sparkles className="w-4 h-4" />
            {isRegenerating ? "Generating LaTeX..." : "Generate Tailored Resume"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950">
      {/* Editor Header Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-zinc-100">
                Tailored Resume &middot; {job.company}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                v{resumeVersion.versionNumber}
              </span>
            </div>
            <p className="text-xs text-zinc-400">{job.title}</p>
          </div>
        </div>

        {/* View Switcher and Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setActiveView("structured")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                activeView === "structured"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Document View
            </button>
            <button
              onClick={() => setActiveView("latex")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                activeView === "latex"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              LaTeX Source (.tex)
            </button>
            <button
              onClick={() => setActiveView("diff")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                activeView === "diff"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              AI Improvements ({resumeVersion.diffItems.length})
            </button>
          </div>

          <button
            onClick={handleCopyLatex}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-xs text-zinc-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy LaTeX"}
          </button>

          <button
            onClick={handleDownloadLatex}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-xs text-zinc-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download .tex
          </button>

          <button
            onClick={handleRegenerateClick}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-xs text-zinc-300 transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            Regenerate
          </button>

          <button
            onClick={onApply}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Apply with this Version
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pt-6">
        {activeView === "structured" && (
          <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Professional Summary Section */}
            <div className="p-6 bg-zinc-900/60 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Professional Summary
                </h3>
                <span className="text-[11px] text-zinc-500">Optimized for ATS Keywords</span>
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed font-sans">
                {resumeVersion.tailoredSummary}
              </p>
            </div>

            {/* Work Experiences Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Tailored Professional Experience
              </h3>

              {resumeVersion.tailoredExperience.map((exp, idx) => (
                <div key={idx} className="p-5 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-100">{exp.role}</h4>
                      <p className="text-xs text-zinc-400 font-medium">
                        {exp.company} &middot; {exp.location}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">
                      {exp.startDate} &mdash; {exp.endDate}
                    </span>
                  </div>

                  <ul className="space-y-2 pt-1">
                    {exp.bulletPoints.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 mt-1.5 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === "latex" && (
          <div className="max-w-4xl mx-auto pb-12">
            <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
              <pre className="text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap select-all">
                {resumeVersion.latexSource}
              </pre>
            </div>
          </div>
        )}

        {activeView === "diff" && (
          <div className="max-w-4xl mx-auto space-y-4 pb-12">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Grounded AI Optimizations &amp; Rationale
            </h3>

            {resumeVersion.diffItems.map((diff, idx) => (
              <div key={idx} className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <span className="font-semibold text-zinc-200">{diff.section}</span>
                  {diff.targetedRequirement && (
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">
                      Matches: {diff.targetedRequirement}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-red-950/20 rounded-lg border border-red-900/30 text-red-300/80">
                    <p className="text-[10px] uppercase font-mono text-red-400 mb-1">Original Candidate Experience</p>
                    <p>{diff.originalText}</p>
                  </div>
                  <div className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-900/30 text-emerald-300">
                    <p className="text-[10px] uppercase font-mono text-emerald-400 mb-1">Tailored Presentation</p>
                    <p>{diff.tailoredText}</p>
                  </div>
                </div>

                <p className="text-zinc-400 text-[11px] pt-1 italic">
                  <strong className="text-zinc-300 not-italic">Rationale:</strong> {diff.rationalization}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
