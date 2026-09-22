"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  CheckmarkCircle02Icon,
  Download01Icon,
  EyeIcon,
  Loading03Icon,
  PrinterIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useResumeStudio } from "./ResumeStudioContext";

export function ResumeStudioPdfPreview() {
  const {
    candidate,
    activeProvider,
    pdfBlobUrl,
    isCompilingPdf,
    compileError,
    compilePdf,
    exportPdf,
    isExportingPdf,
  } = useResumeStudio();

  const [isLogsExpanded, setIsLogsExpanded] = useState<boolean>(true);

  if (!candidate) {
    return (
      <div className="flex items-center justify-center h-full rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#121417] p-8 text-center text-zinc-400">
        Loading candidate profile...
      </div>
    );
  }

  const handlePrint = () => {
    if (pdfBlobUrl) {
      const printWindow = window.open(pdfBlobUrl, "_blank");
      if (printWindow) {
        printWindow.focus();
      } else {
        window.print();
      }
    } else {
      window.print();
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#121417] overflow-hidden shadow-lg">
      {/* Preview Column Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181b1f] border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={EyeIcon} size={15} className="text-[#a7f3d0]" />
          <span className="text-xs font-mono font-bold text-white tracking-wide">
            PDF Document Preview
          </span>
          <Badge variant="lavender" className="text-[10px] font-mono uppercase">
            {activeProvider}
          </Badge>

          {isCompilingPdf ? (
            <span className="flex items-center gap-1.5 text-[11px] text-amber-300 font-mono">
              <HugeiconsIcon icon={Loading03Icon} size={12} className="animate-spin text-amber-400" />
              Compiling...
            </span>
          ) : compileError ? (
            <span className="flex items-center gap-1.5 text-[11px] text-red-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Compilation Error
            </span>
          ) : pdfBlobUrl ? (
            <span className="flex items-center gap-1.5 text-[11px] text-[#a7f3d0] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a7f3d0] animate-pulse" />
              Live Native PDF
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              Idle
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => compilePdf()}
            disabled={isCompilingPdf}
            title="Recompile PDF"
            className="h-7 px-2 text-[11px] text-zinc-400 hover:text-white"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              size={13}
              className={isCompilingPdf ? "animate-spin text-amber-400" : ""}
            />
            <span className="ml-1 hidden sm:inline">Recompile</span>
          </Button>

          {compileError && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLogsExpanded((prev) => !prev)}
              className="h-7 px-2 text-[11px] text-red-300 hover:text-red-200 bg-red-950/30 border border-red-800/40"
            >
              <HugeiconsIcon
                icon={isLogsExpanded ? ArrowDown01Icon : ArrowUp01Icon}
                size={12}
                className="mr-1"
              />
              <span>{isLogsExpanded ? "Hide Logs" : "View Logs"}</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            disabled={!pdfBlobUrl}
            title="Print Document"
            className="h-7 px-2 text-[11px] text-zinc-400 hover:text-white"
          >
            <HugeiconsIcon icon={PrinterIcon} size={13} />
          </Button>

          <Button
            variant="sage"
            size="sm"
            onClick={exportPdf}
            disabled={isExportingPdf}
            className="h-7 px-2.5 text-[11px] font-semibold"
          >
            <HugeiconsIcon icon={Download01Icon} size={13} className="mr-1" />
            <span>{isExportingPdf ? "Exporting..." : "Export PDF"}</span>
          </Button>
        </div>
      </div>

      {/* Main Preview Viewport */}
      <div className="flex-1 relative w-full h-[680px] min-h-[500px] bg-[#0c0d0e] flex flex-col overflow-hidden">
        {/* Compilation Loading Overlay (Initial) */}
        {isCompilingPdf && !pdfBlobUrl && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0c0d0e]/90 backdrop-blur-sm p-6 text-center">
            <div className="p-4 rounded-2xl bg-[#181b1f] border border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col items-center max-w-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-3">
                <HugeiconsIcon
                  icon={Loading03Icon}
                  size={24}
                  className="animate-spin text-amber-400"
                />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Compiling LaTeX with WebAssembly...
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                TeX Live WASM is processing your LaTeX document into high-fidelity PDF without external servers.
              </p>
            </div>
          </div>
        )}

        {/* Subtle background compiling banner when existing preview is displayed */}
        {isCompilingPdf && pdfBlobUrl && (
          <div className="absolute top-3 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181b1f]/90 border border-amber-400/30 text-amber-300 text-xs shadow-lg backdrop-blur-md">
            <HugeiconsIcon icon={Loading03Icon} size={13} className="animate-spin text-amber-400" />
            <span>Compiling LaTeX with WebAssembly...</span>
          </div>
        )}

        {/* Retractable Logs / Error Panel */}
        {compileError && (
          <div className="z-30 w-full border-b border-red-800/40 bg-[#160b0c] p-3 flex flex-col gap-2 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
                <HugeiconsIcon icon={AlertCircleIcon} size={15} className="text-red-400" />
                <span>PDF Compilation Failed</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => compilePdf()}
                  className="text-[11px] font-mono text-zinc-300 hover:text-white underline cursor-pointer"
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogsExpanded((prev) => !prev)}
                  className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  <HugeiconsIcon
                    icon={isLogsExpanded ? ArrowUp01Icon : ArrowDown01Icon}
                    size={14}
                  />
                </button>
              </div>
            </div>

            {isLogsExpanded && (
              <pre className="p-3 text-[11px] font-mono leading-relaxed bg-[#0e0607] text-red-300/90 border border-red-900/30 rounded-lg max-h-48 overflow-y-auto whitespace-pre-wrap select-text">
                {compileError}
              </pre>
            )}
          </div>
        )}

        {/* Native PDF Object Rendering */}
        {pdfBlobUrl ? (
          <div className="flex-1 w-full h-full relative">
            <object
              data={pdfBlobUrl}
              type="application/pdf"
              className="w-full h-full rounded-b-xl"
            >
              <iframe
                src={pdfBlobUrl}
                title="Resume PDF Preview"
                className="w-full h-full"
              />
            </object>
          </div>
        ) : !isCompilingPdf && !compileError ? (
          <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-zinc-400">
            <HugeiconsIcon icon={EyeIcon} size={32} className="text-zinc-600 mb-3" />
            <p className="text-xs text-zinc-300 font-medium mb-1">No PDF compiled yet</p>
            <p className="text-xs text-zinc-500 mb-4 max-w-xs">
              Click compile to generate your native PDF with {activeProvider.toUpperCase()}.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => compilePdf()}
              className="gap-1.5 text-xs text-zinc-200"
            >
              <HugeiconsIcon icon={RefreshIcon} size={13} />
              <span>Compile PDF</span>
            </Button>
          </div>
        ) : null}
      </div>

      {/* Footer Info bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#181b1f] border-t border-[rgba(255,255,255,0.06)] text-[11px] text-zinc-500 font-mono">
        <span className="flex items-center gap-1.5">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} className="text-[#a7f3d0]" />
          <span>WebAssembly TeX Live 2024 Engine • Native PDF</span>
        </span>
        <span className="text-[10px] text-zinc-600">Client-Side WASM Compilation</span>
      </div>
    </div>
  );
}
