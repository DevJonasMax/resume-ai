import type { Job, JobRequirements } from "@resume-ai/types";
import {
  Bot,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileText,
  HelpCircle,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="glass-panel rounded-2xl w-full max-w-3xl flex flex-col max-h-[90vh] border border-zinc-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-zinc-800 bg-zinc-900/60">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
              {job.status.replace("_", " ")}
            </span>
            <h3 className="text-lg font-bold text-white mt-1.5">{job.title}</h3>
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                {job.company}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                {job.location || "Remote"}
              </span>
              {job.url && (
                <>
                  <span>•</span>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                  >
                    <span>Posting</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col p-6 gap-6 overflow-y-auto">
          {/* Analysis section if exists */}
          {requirements ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-zinc-900/90 rounded-xl border border-zinc-800">
                <div>
                  <span className="text-xs font-semibold text-zinc-400">ATS Match Assessment</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-indigo-400">
                      {requirements.gapAnalysis?.matchPercentage ?? 80}%
                    </span>
                    <span className="text-xs text-zinc-400">compatibility with candidate base truth</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 bg-zinc-800 rounded-lg text-zinc-300 border border-zinc-700">
                    Seniority: <strong className="text-white">{requirements.seniorityLevel}</strong>
                  </span>
                  <span className="text-xs px-2.5 py-1 bg-zinc-800 rounded-lg text-zinc-300 border border-zinc-700">
                    Model: <strong className="text-white">{requirements.workModel}</strong>
                  </span>
                </div>
              </div>

              {/* Skills & Jev criticality */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Key Technical Competencies &amp; Jev Criticality</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {requirements.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-200">{skill.name}</span>
                        {skill.required && (
                          <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/40">
                            Required
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-purple-400 font-mono">
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
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Matching Strengths
                    </span>
                    <ul className="list-disc list-inside text-emerald-200/90 space-y-0.5">
                      {requirements.gapAnalysis.matchingSkills.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Identified Growth Areas
                    </span>
                    <ul className="list-disc list-inside text-amber-200/90 space-y-0.5">
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
            <div className="p-6 bg-zinc-900/60 rounded-xl border border-zinc-800 text-center flex flex-col items-center gap-3">
              <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-white">Job Posting Not Analyzed Yet</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Extract requirements and evaluate candidate match percentage using Gemini and Jev.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>{isAnalyzing ? "Extracting Requirements..." : "Analyze with AI"}</span>
              </button>
            </div>
          )}

          {/* Description */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Raw Description</h4>
            <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs text-zinc-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap font-sans">
              {job.description}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-zinc-800 bg-zinc-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onTailorResume(job);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-purple-600/20 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Open Resume Studio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onApply(job);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Launch Agent</span>
          </button>
        </div>
      </div>
    </div>
  );
}
