"use client";

import { Check, Code2, Copy, FileText, RotateCcw, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useResumeStudio } from "./ResumeStudioContext";

export function ResumeStudioLatexEditor() {
  const {
    editedLatex,
    setEditedLatex,
    isLatexDirty,
    isSaving,
    saveLatex,
    resume,
  } = useResumeStudio();

  const [copied, setCopied] = useState(false);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = editedLatex.split("\n");
  const lineCount = lines.length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedLatex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetToSource = () => {
    if (confirm("Reset current editor contents back to original version source?")) {
      setEditedLatex(resume.latexSource);
    }
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Keyboard shortcut: Ctrl+S / Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (isLatexDirty && !isSaving) {
          saveLatex();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLatexDirty, isSaving, saveLatex]);

  return (
    <div className="flex flex-col h-full rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
      {/* Editor Column Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-mono font-bold text-white tracking-wide">
            resume.tex
          </span>
          <span className="text-[11px] font-mono text-zinc-500">
            {lineCount} lines • {editedLatex.length} chars
          </span>
          {isLatexDirty ? (
            <Badge variant="amber" className="text-[10px]">
              Unsaved
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] text-zinc-500">
              Synced
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {isLatexDirty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetToSource}
              title="Reset to generated source"
              className="h-7 px-2 text-[11px] text-zinc-400 hover:text-white"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2.5 text-[11px] text-zinc-300 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400 mr-1" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                <span>Copy</span>
              </>
            )}
          </Button>

          <Button
            variant={isLatexDirty ? "indigo" : "secondary"}
            size="sm"
            onClick={saveLatex}
            disabled={isSaving || !isLatexDirty}
            className="h-7 px-3 text-[11px] font-semibold"
          >
            <Save className="w-3 h-3 mr-1" />
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </Button>
        </div>
      </div>

      {/* Editor Body: Line numbers + Textarea */}
      <div className="relative flex flex-1 h-[680px] overflow-hidden font-mono text-xs bg-zinc-950">
        {/* Line numbers gutter */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="w-12 select-none py-3 pr-3 text-right text-zinc-600 bg-zinc-950 border-r border-zinc-800/80 overflow-hidden shrink-0 leading-relaxed"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="h-5 text-[11px]">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea code surface */}
        <textarea
          ref={textareaRef}
          value={editedLatex}
          onChange={(e) => setEditedLatex(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="flex-1 w-full h-full p-3 bg-transparent text-zinc-200 outline-none resize-none leading-relaxed font-mono text-[12px] whitespace-pre overflow-y-auto selection:bg-indigo-600/30 selection:text-indigo-200 focus:outline-none"
        />
      </div>

      {/* Footer Info bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/60 border-t border-zinc-800/80 text-[11px] text-zinc-500 font-mono">
        <span className="flex items-center gap-1.5">
          <FileText className="w-3 h-3 text-zinc-400" />
          <span>LaTeX 2e • UTF-8</span>
        </span>
        <span>Press Ctrl+S to save</span>
      </div>
    </div>
  );
}
