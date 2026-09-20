import type { Job, JobRequirements } from "@resume-ai/types";
import {
  AlertCircle,
  Bot,
  Building2,
  CheckCircle,
  FileText,
  MapPin,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import React, { useState } from "react";

interface JobModalProps {
  job: Job;
  requirements: JobRequirements | null;
  onClose: () => void;
  onAnalyze: () => Promise<void>;
  onTailorResume: () => void;
  onApply: () => void;
}

export const JobModal: React.FC<JobModalProps> = ({
  job,
  requirements,
  onClose,
  onAnalyze,
  onTailorResume,
  onApply,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeClick = async () => {
    setIsAnalyzing(true);
    try {
      await onAnalyze();
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col w-full max-w-2xl max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">{job.title}</h2>
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                {job.company}
              </span>
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  {job.location}
                </span>
              )}
              <span className="capitalize px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                {job.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-zinc-300">
          {/* Action Trigger Bar */}
          <div className="flex items-center gap-2 p-3 bg-zinc-950/60 rounded-lg border border-zinc-800">
            <button
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
              {isAnalyzing ? "Analyzing with Jev..." : "Analyze Requirements"}
            </button>

            <button
              onClick={onTailorResume}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Tailor LaTeX Resume
            </button>

            <button
              onClick={onApply}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors ml-auto"
            >
              <Bot className="w-3.5 h-3.5" />
              Apply via Agent
            </button>
          </div>

          {/* Structured Requirements Section */}
          {requirements ? (
            <div className="space-y-4">
              {/* Match Assessment Pill */}
              {requirements.gapAnalysis && (
                <div className="p-4 bg-emerald-950/15 rounded-lg border border-emerald-800/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-400">Candidate Match Score</span>
                    <span className="text-base font-bold font-mono text-emerald-300">
                      {requirements.gapAnalysis.matchPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${requirements.gapAnalysis.matchPercentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Strengths: {requirements.gapAnalysis.strengths.join(" ")}
                  </p>
                </div>
              )}

              {/* Skills with Jev Criticality Stars */}
              <div>
                <h4 className="font-semibold uppercase tracking-wider text-[11px] text-zinc-400 mb-2">
                  Skills &amp; Jev Criticality
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {requirements.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-zinc-950/40 border border-zinc-800/60"
                    >
                      <div>
                        <span className="font-medium text-zinc-200">{skill.name}</span>
                        <span className="block text-[10px] text-zinc-500 capitalize">{skill.category}</span>
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, starIdx) => (
                          <Star
                            key={starIdx}
                            className={`w-3 h-3 ${
                              starIdx < skill.criticalityScore ? "fill-amber-400 text-amber-400" : "text-zinc-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Responsibilities */}
              <div>
                <h4 className="font-semibold uppercase tracking-wider text-[11px] text-zinc-400 mb-2">
                  Key Responsibilities
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-zinc-300">
                  {requirements.responsibilities.map((r, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-zinc-950/40 rounded-lg border border-zinc-800/80 text-center">
              <p className="text-zinc-400">
                This job has not been analyzed yet. Click <strong>Analyze Requirements</strong> to extract
                structured skills and evaluate candidate fit with TypeSafe Jev.
              </p>
            </div>
          )}

          {/* Raw Job Description */}
          <div>
            <h4 className="font-semibold uppercase tracking-wider text-[11px] text-zinc-400 mb-2">
              Original Job Posting
            </h4>
            <div className="p-3.5 bg-zinc-950/80 rounded-lg border border-zinc-800/60 font-mono text-[11px] text-zinc-400 whitespace-pre-wrap max-h-48 overflow-y-auto">
              {job.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
