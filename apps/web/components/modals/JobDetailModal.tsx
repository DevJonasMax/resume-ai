import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiBrain01Icon,
  Building02Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  HelpCircleIcon,
  LinkSquare01Icon,
  Location01Icon,
  NoteEditIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import type { Job, JobRequirements } from "@resume-ai/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface JobDetailModalProps {
  job: Job | null;
  requirements: JobRequirements | null;
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (job: Job) => Promise<void>;
  onTailorResume: (job: Job) => void;
  onApply: (job: Job) => void;
}

export function JobDetailModal({
  job,
  requirements,
  isOpen,
  onClose,
  onAnalyze,
  onTailorResume,
  onApply,
}: JobDetailModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen || !job) return null;

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await onAnalyze(job);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="prism-panel rounded-2xl w-full max-w-3xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[rgba(255,255,255,0.06)] bg-[#181b1f]/60">
          <div>
            <Badge variant="sky" className="text-[10px] uppercase font-mono">
              {job.status.replace("_", " ")}
            </Badge>
            <h3 className="text-base font-bold text-white mt-1.5">{job.title}</h3>
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Building02Icon} size={13} className="text-zinc-500" />
                {job.company}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Location01Icon} size={13} className="text-zinc-500" />
                {job.location || "Remote"}
              </span>
              {job.url && (
                <>
                  <span>•</span>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#93c5fd] hover:underline"
                  >
                    <span>Posting</span>
                    <HugeiconsIcon icon={LinkSquare01Icon} size={11} />
                  </a>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1e2228] transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col p-6 gap-6 overflow-y-auto">
          {/* Analysis section if exists */}
          {requirements ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#181b1f] rounded-xl border border-[rgba(255,255,255,0.07)]">
                <div>
                  <span className="text-xs font-semibold text-zinc-400">ATS Match Assessment</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-[#a7f3d0] font-mono">
                      {requirements.gapAnalysis?.matchPercentage ?? 80}%
                    </span>
                    <span className="text-xs text-zinc-400">compatibility with candidate base truth</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs px-2.5 py-1 bg-[#121417] rounded-lg text-zinc-300 border border-[rgba(255,255,255,0.06)]">
                    Seniority: <strong className="text-white">{requirements.seniorityLevel}</strong>
                  </span>
                  <span className="text-xs px-2.5 py-1 bg-[#121417] rounded-lg text-zinc-300 border border-[rgba(255,255,255,0.06)]">
                    Model: <strong className="text-white">{requirements.workModel}</strong>
                  </span>
                </div>
              </div>

              {/* Skills & Jev criticality */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <HugeiconsIcon icon={SparklesIcon} size={13} className="text-[#d8b4fe]" />
                  <span>Key Technical Competencies &amp; Jev Criticality</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {requirements.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#181b1f] rounded-lg border border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-200">{skill.name}</span>
                        {skill.required && (
                          <Badge variant="apricot" className="text-[9px]">
                            Required
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-[#d8b4fe] font-mono">
                        {"★".repeat(skill.criticalityScore)}
                        {"☆".repeat(Math.max(0, 5 - skill.criticalityScore))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Recommendations */}
              {requirements.gapAnalysis && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 badge-sage rounded-lg text-xs space-y-1">
                    <span className="font-bold text-[#a7f3d0] flex items-center gap-1">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                      Matching Strengths
                    </span>
                    <ul className="list-disc list-inside text-zinc-200 space-y-0.5">
                      {requirements.gapAnalysis.matchingSkills.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 badge-apricot rounded-lg text-xs space-y-1">
                    <span className="font-bold text-[#fdba74] flex items-center gap-1">
                      <HugeiconsIcon icon={HelpCircleIcon} size={14} />
                      Identified Growth Areas
                    </span>
                    <ul className="list-disc list-inside text-zinc-200 space-y-0.5">
                      {requirements.gapAnalysis.missingSkills.length > 0 ? (
                        requirements.gapAnalysis.missingSkills.map((s, i) => <li key={i}>{s}</li>)
                      ) : (
                        <li>No significant technical skill gaps detected.</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 bg-[#181b1f] rounded-xl border border-[rgba(255,255,255,0.06)] text-center flex flex-col items-center gap-3">
              <HugeiconsIcon icon={SparklesIcon} size={28} className="text-[#93c5fd] animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-white">Job Posting Not Analyzed Yet</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Extract requirements and evaluate candidate match percentage using Gemini and Jev.
                </p>
              </div>
              <Button
                variant="sky"
                size="sm"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                <span>{isAnalyzing ? "Extracting Requirements..." : "Analyze with AI"}</span>
              </Button>
            </div>
          )}

          {/* Description */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-[rgba(255,255,255,0.06)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Raw Description</h4>
            <div className="p-4 bg-[#0c0d0e] rounded-xl border border-[rgba(255,255,255,0.06)] text-xs text-zinc-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap font-sans">
              {job.description}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 p-4 border-t border-[rgba(255,255,255,0.06)] bg-[#181b1f]/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>

          <Button
            variant="lavender"
            size="sm"
            onClick={() => {
              onClose();
              onTailorResume(job);
            }}
            className="gap-1.5"
          >
            <HugeiconsIcon icon={NoteEditIcon} size={13} />
            <span>Open Resume Studio</span>
          </Button>

          <Button
            variant="sky"
            size="sm"
            onClick={() => {
              onClose();
              onApply(job);
            }}
            className="gap-1.5"
          >
            <HugeiconsIcon icon={AiBrain01Icon} size={13} />
            <span>Launch Agent</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
