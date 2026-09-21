"use client";

import {
  CheckCircle,
  Download,
  Eye,
  Mail,
  MapPin,
  Phone,
  Printer,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
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
      <div className="flex items-center justify-center h-full rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-400">
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
    <div className="flex flex-col h-full rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
      {/* Preview Column Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-white tracking-wide">
            PDF Document Preview
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>

        {/* Zoom and Page controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
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
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleFitPage}
            className={`h-7 px-2 text-[11px] ${
              zoomMode === "fit-page" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Fit Page
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleFitWidth}
            className={`h-7 px-2 text-[11px] ${
              zoomMode === "fit-width" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
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
            <Printer className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="indigo"
            size="sm"
            onClick={exportPdf}
            disabled={isExportingPdf}
            className="h-7 px-2.5 text-[11px] font-semibold"
          >
            <Download className="w-3 h-3 mr-1" />
            <span>{isExportingPdf ? "Exporting..." : "Export"}</span>
          </Button>
        </div>
      </div>

      {/* Preview Scrollable Viewport */}
      <div className="flex-1 h-[680px] overflow-y-auto overflow-x-auto p-4 sm:p-6 bg-zinc-900/40 flex justify-center items-start">
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
            className="w-[794px] min-h-[1123px] bg-zinc-950 text-zinc-100 border border-zinc-700/80 shadow-2xl rounded-sm p-10 flex flex-col gap-6 font-sans print:bg-white print:text-zinc-900 print:border-none print:shadow-none print:w-full print:p-0"
          >
            {/* Candidate Header */}
            <div className="flex flex-col items-center text-center pb-5 border-b border-zinc-700/80">
              <h1 className="text-2xl font-bold tracking-tight text-white uppercase mb-2">
                {candidate.fullName}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  {candidate.phone}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  {candidate.email}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {candidate.location}
                </span>
              </div>
            </div>

            {/* Professional Summary */}
            <div
              className={`flex flex-col gap-2 rounded-lg transition-all duration-300 p-2 ${
                isSummaryActiveDiff
                  ? "ring-2 ring-indigo-500/80 bg-indigo-950/30"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between border-b border-indigo-500/30 pb-1">
                <h2 className="text-xs font-bold tracking-wider uppercase text-indigo-400">
                  Professional Summary
                </h2>
                <Badge variant="indigo" className="text-[10px] gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  ATS Aligned
                </Badge>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed pt-1">
                {resume.tailoredSummary}
              </p>
            </div>

            {/* Core Competencies & Skills */}
            <div className="flex flex-col gap-2 p-2">
              <h2 className="text-xs font-bold tracking-wider uppercase text-indigo-400 border-b border-indigo-500/30 pb-1">
                Core Competencies & Technical Skills
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {Object.entries(candidate.skills || {}).map(([category, items]) => {
                  const skillList = Array.isArray(items) ? (items as string[]) : [];
                  return (
                    <div
                      key={category}
                      className="p-2.5 bg-zinc-900/60 rounded border border-zinc-800 flex flex-col gap-1"
                    >
                      <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
                        {category.replace(/_/g, " ")}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {skillList.map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] px-1.5 py-0.2 bg-zinc-800/80 text-zinc-300 rounded font-mono border border-zinc-700/60"
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
              <h2 className="text-xs font-bold tracking-wider uppercase text-indigo-400 border-b border-indigo-500/30 pb-1">
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
                      isExpActive ? "ring-2 ring-purple-500/70 bg-purple-950/20" : ""
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
                <h2 className="text-xs font-bold tracking-wider uppercase text-indigo-400 border-b border-indigo-500/30 pb-1">
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
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/60 border-t border-zinc-800/80 text-[11px] text-zinc-500 font-mono">
        <span className="flex items-center gap-1.5">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          <span>A4 Aspect Ratio (210 x 297mm) • ATS Scanner Verified</span>
        </span>
        <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
      </div>
    </div>
  );
}
