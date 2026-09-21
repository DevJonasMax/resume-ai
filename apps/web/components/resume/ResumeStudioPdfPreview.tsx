"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Call02Icon,
  CheckmarkCircle02Icon,
  Download01Icon,
  EyeIcon,
  Location01Icon,
  Mail01Icon,
  PrinterIcon,
  SparklesIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useResumeStudio } from "./ResumeStudioContext";

export function ResumeStudioPdfPreview() {
  const {
    resume,
    candidate,
    zoomLevel,
    setZoomLevel,
    zoomMode,
    setZoomMode,
    exportPdf,
    isExportingPdf,
    activeDiffKey,
  } = useResumeStudio();

  if (!candidate) {
    return (
      <div className="flex items-center justify-center h-full rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#121417] p-8 text-center text-zinc-400">
        Loading candidate profile...
      </div>
    );
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(1.5, Math.round((prev + 0.1) * 10) / 10));
    setZoomMode("custom");
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.6, Math.round((prev - 0.1) * 10) / 10));
    setZoomMode("custom");
  };

  const handleSet100 = () => {
    setZoomLevel(1);
    setZoomMode("custom");
  };

  const handleFitWidth = () => {
    setZoomLevel(1.1);
    setZoomMode("fit-width");
  };

  const handleFitPage = () => {
    setZoomLevel(0.85);
    setZoomMode("fit-page");
  };

  const isSummaryActiveDiff =
    activeDiffKey !== null &&
    resume.diffItems?.some(
      (d, i) =>
        d.section?.toLowerCase().includes("summary") &&
        activeDiffKey === `${d.section}-${i}`
    );

  return (
    <div className="flex flex-col h-full rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#121417] overflow-hidden shadow-lg">
      {/* Preview Column Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181b1f] border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={EyeIcon} size={15} className="text-[#a7f3d0]" />
          <span className="text-xs font-mono font-bold text-white tracking-wide">
            PDF Document Preview
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-[#a7f3d0] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a7f3d0] animate-pulse" />
            Live
          </span>
        </div>

        {/* Zoom and Page controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-[#121417] border border-[rgba(255,255,255,0.08)] rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <HugeiconsIcon icon={ZoomOutIcon} size={13} />
            </button>

            <span className="px-2 text-[11px] font-mono text-zinc-300 select-none">
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
              title="Zoom In"
            >
              <HugeiconsIcon icon={ZoomInIcon} size={13} />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleFitPage}
            className={`h-7 px-2 text-[11px] ${
              zoomMode === "fit-page" ? "bg-[#20242a] text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Fit Page
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleFitWidth}
            className={`h-7 px-2 text-[11px] ${
              zoomMode === "fit-width" ? "bg-[#20242a] text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Fit Width
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSet100}
            className="h-7 px-2 text-[11px] text-zinc-400 hover:text-white"
          >
            100%
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.print()}
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
            <span>{isExportingPdf ? "Exporting..." : "Export"}</span>
          </Button>
        </div>
      </div>

      {/* Preview Scrollable Viewport */}
      <div className="flex-1 h-[680px] overflow-y-auto overflow-x-auto p-4 sm:p-6 bg-[#0c0d0e]/60 flex justify-center items-start">
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease-out",
          }}
          className="pb-12"
        >
          {/* Realistic A4 Document Sheet */}
          <div
            id="resume-document-sheet"
            className="w-[794px] min-h-[1123px] bg-[#121417] text-zinc-100 border border-[rgba(255,255,255,0.09)] shadow-2xl rounded-sm p-10 flex flex-col gap-6 font-sans print:bg-white print:text-zinc-900 print:border-none print:shadow-none print:w-full print:p-0"
          >
            {/* Candidate Header */}
            <div className="flex flex-col items-center text-center pb-5 border-b border-[rgba(255,255,255,0.08)]">
              <h1 className="text-2xl font-bold tracking-tight text-white uppercase mb-2">
                {candidate.fullName}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={Call02Icon} size={13} className="text-[#a7f3d0]" />
                  {candidate.phone}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={Mail01Icon} size={13} className="text-[#a7f3d0]" />
                  {candidate.email}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={Location01Icon} size={13} className="text-[#a7f3d0]" />
                  {candidate.location}
                </span>
              </div>
            </div>

            {/* Professional Summary */}
            <div
              className={`flex flex-col gap-2 rounded-lg transition-all duration-300 p-2.5 ${
                isSummaryActiveDiff
                  ? "ring-1 ring-[#d8b4fe]/80 bg-[#d8b4fe]/5"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#a7f3d0]/20 pb-1">
                <h2 className="text-xs font-bold tracking-wider uppercase text-[#a7f3d0]">
                  Professional Summary
                </h2>
                <Badge variant="sage" className="text-[10px] gap-1">
                  <HugeiconsIcon icon={SparklesIcon} size={10} />
                  ATS Aligned
                </Badge>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed pt-1">
                {resume.tailoredSummary}
              </p>
            </div>

            {/* Core Competencies & Skills */}
            <div className="flex flex-col gap-2 p-2">
              <h2 className="text-xs font-bold tracking-wider uppercase text-[#a7f3d0] border-b border-[#a7f3d0]/20 pb-1">
                Core Competencies & Technical Skills
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {Object.entries(candidate.skills || {}).map(([category, items]) => {
                  const skillList = Array.isArray(items) ? (items as string[]) : [];
                  return (
                    <div
                      key={category}
                      className="p-2.5 bg-[#181b1f] rounded border border-[rgba(255,255,255,0.06)] flex flex-col gap-1"
                    >
                      <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
                        {category.replace(/_/g, " ")}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {skillList.map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] px-1.5 py-0.2 bg-[#121417] text-zinc-300 rounded font-mono border border-[rgba(255,255,255,0.06)]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Professional Experience */}
            <div className="flex flex-col gap-3.5 p-2">
              <h2 className="text-xs font-bold tracking-wider uppercase text-[#a7f3d0] border-b border-[#a7f3d0]/20 pb-1">
                Professional Experience
              </h2>

              {(resume.tailoredExperience || []).map((exp, idx) => {
                const isExpActive =
                  activeDiffKey !== null &&
                  resume.diffItems?.some(
                    (d, i) =>
                      `${d.section}-${i}` === activeDiffKey &&
                      d.section?.toLowerCase().includes("experience")
                  );

                return (
                  <div
                    key={`${exp.company}-${idx}`}
                    className={`flex flex-col gap-1.5 rounded-lg transition-all duration-300 p-2 ${
                      isExpActive ? "ring-1 ring-[#d8b4fe]/80 bg-[#d8b4fe]/5" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white">
                        {exp.role}{" "}
                        <span className="text-zinc-400 font-normal">
                          • {exp.company}
                        </span>
                      </h3>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>

                    <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-zinc-300 leading-relaxed">
                      {(exp.bulletPoints || []).map((bullet: string, bIdx: number) => (
                        <li key={bIdx} className="pl-0.5">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Education */}
            {candidate.education && candidate.education.length > 0 && (
              <div className="flex flex-col gap-2 p-2">
                <h2 className="text-xs font-bold tracking-wider uppercase text-[#a7f3d0] border-b border-[#a7f3d0]/20 pb-1">
                  Education & Qualifications
                </h2>
                <div className="space-y-1.5 pt-1">
                  {candidate.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs text-zinc-300"
                    >
                      <div>
                        <span className="font-semibold text-white">
                          {edu.degree}
                        </span>
                        <span className="text-zinc-400"> • {edu.institution}</span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {edu.endDate || edu.startDate || ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#181b1f] border-t border-[rgba(255,255,255,0.06)] text-[11px] text-zinc-500 font-mono">
        <span className="flex items-center gap-1.5">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} className="text-[#a7f3d0]" />
          <span>A4 Aspect Ratio (210 x 297mm) • ATS Scanner Verified</span>
        </span>
        <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
      </div>
    </div>
  );
}
