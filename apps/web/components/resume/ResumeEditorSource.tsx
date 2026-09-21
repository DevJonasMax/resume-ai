"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Copy01Icon,
  FloppyDiskIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { useResumeEditor } from "./ResumeEditorContext.js";

export function ResumeEditorSource() {
  const { editedLatex, onLatexChange, onSaveLatex, isSaving, onRefineWithAgent, isRefining } = useResumeEditor();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedLatex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 max-w-4xl mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400">LaTeX Source (.tex)</span>
          <span className="text-[11px] text-zinc-500 font-mono">
            {editedLatex.split("\n").length} lines
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onRefineWithAgent()}
            disabled={isRefining}
            className="flex items-center gap-1.5 px-3 py-1 bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 rounded text-xs font-semibold border border-purple-700/50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <HugeiconsIcon icon={SparklesIcon} size={14} className="text-purple-400" />
            <span>{isRefining ? "Refining..." : "Agent Refine"}</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors cursor-pointer"
          >
            {copied ? (
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-400" />
            ) : (
              <HugeiconsIcon icon={Copy01Icon} size={14} />
            )}
            <span>{copied ? "Copied" : "Copy Source"}</span>
          </button>
          <button
            type="button"
            onClick={onSaveLatex}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            <HugeiconsIcon icon={FloppyDiskIcon} size={14} />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950 font-mono text-xs">
        <textarea
          value={editedLatex}
          onChange={(e) => onLatexChange(e.target.value)}
          rows={26}
          spellCheck={false}
          className="w-full bg-zinc-950 text-zinc-200 p-4 font-mono leading-relaxed outline-none resize-y selection:bg-indigo-500/30 selection:text-indigo-200"
        />
      </div>
    </div>
  );
}
