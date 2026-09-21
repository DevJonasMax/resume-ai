"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Copy01Icon,
  FileCodeIcon,
  FloppyDiskIcon,
  NoteEditIcon,
  ReloadIcon,
} from "@hugeicons/core-free-icons";
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

  const handleGutterWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop += e.deltaY;
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        editedLatex.substring(0, start) + "  " + editedLatex.substring(end);
      setEditedLatex(newValue);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
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
    <div className="flex flex-col h-full rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#121417] overflow-hidden shadow-lg">
      {/* Editor Column Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#181b1f] border-b border-[rgba(255,255,255,0.06)] shrink-0">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={FileCodeIcon} size={15} className="text-[#93c5fd]" />
          <span className="text-xs font-mono font-bold text-white tracking-wide">
            resume.tex
          </span>
          <span className="text-[11px] font-mono text-zinc-500">
            {lineCount} lines • {editedLatex.length} chars
          </span>
          {isLatexDirty ? (
            <Badge variant="apricot" className="text-[10px]">
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
              <HugeiconsIcon icon={ReloadIcon} size={12} className="mr-1" />
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
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} className="text-[#a7f3d0] mr-1" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <HugeiconsIcon icon={Copy01Icon} size={12} className="mr-1" />
                <span>Copy</span>
              </>
            )}
          </Button>

          <Button
            variant={isLatexDirty ? "apricot" : "secondary"}
            size="sm"
            onClick={saveLatex}
            disabled={isSaving || !isLatexDirty}
            className="h-7 px-3 text-[11px] font-semibold"
          >
            <HugeiconsIcon icon={FloppyDiskIcon} size={12} className="mr-1" />
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </Button>
        </div>
      </div>

      {/* Editor Body: Line numbers + Textarea */}
      <div className="relative flex flex-1 min-h-0 h-full w-full overflow-hidden font-mono text-xs bg-[#0c0d0e]">
        {/* Line numbers gutter */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          onWheel={handleGutterWheel}
          className="w-12 select-none py-3 pr-3 pl-2 text-right text-zinc-500 bg-[#0e1012] border-r border-[rgba(255,255,255,0.06)] overflow-hidden shrink-0"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i + 1}
              className="h-6 leading-6 text-[11px] font-mono select-none"
              style={{ height: "24px", lineHeight: "24px" }}
            >
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
          onKeyDown={handleTextareaKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="flex-1 min-w-0 h-full w-full p-3 bg-transparent text-zinc-200 outline-none resize-none font-mono text-[12px] whitespace-pre overflow-auto selection:bg-[#93c5fd]/20 selection:text-[#93c5fd] focus:outline-none"
          style={{ lineHeight: "24px" }}
        />
      </div>

      {/* Footer Info bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#181b1f] border-t border-[rgba(255,255,255,0.06)] text-[11px] text-zinc-500 font-mono shrink-0">
        <span className="flex items-center gap-1.5">
          <HugeiconsIcon icon={NoteEditIcon} size={12} className="text-zinc-400" />
          <span>LaTeX 2e • UTF-8</span>
        </span>
        <span>Ctrl+S to save</span>
      </div>
    </div>
  );
}
