"use client";

import { CheckCircle2, Sparkles } from "lucide-react";
import { useResumeEditor } from "./ResumeEditorContext.js";

export function ResumeEditorDiffList() {
  const { resume } = useResumeEditor();

  if (!resume.diffItems || resume.diffItems.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-400 glass-card rounded-xl">
        No tailoring modifications recorded for this version.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>ATS Alignment Rationales</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Verified modifications tailored for this job description without hallucinating unverified candidate experience.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-purple-950/60 text-purple-300 rounded-full border border-purple-800/60">
          {resume.diffItems.length} changes
        </span>
      </div>

      <div className="space-y-4">
        {resume.diffItems.map((diff, index) => (
          <div
            key={index}
            className="glass-card rounded-xl p-4.5 border border-zinc-700/60 flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-800/40">
                {diff.section}
              </span>
              {diff.targetedRequirement && (
                <span className="text-[11px] font-medium text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/30">
                  Target: {diff.targetedRequirement}
                </span>
              )}
            </div>

            {diff.originalText && (
              <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-xs text-red-300 leading-relaxed">
                <span className="font-semibold block text-[10px] uppercase tracking-wider text-red-400 mb-1">
                  Original Source:
                </span>
                <p className="line-through opacity-85">{diff.originalText}</p>
              </div>
            )}

            <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-xs text-emerald-200 leading-relaxed">
              <span className="font-semibold block text-[10px] uppercase tracking-wider text-emerald-400 mb-1">
                Tailored Content:
              </span>
              <p>{diff.tailoredText}</p>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex items-start gap-2 text-xs text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-semibold text-zinc-200">Engineering Rationale:</span>
                <p className="text-zinc-400">{diff.rationalization}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
