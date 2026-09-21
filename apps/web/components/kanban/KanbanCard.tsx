"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiBrain01Icon,
  Building02Icon,
  Location01Icon,
  NoteEditIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import type { Job } from "@resume-ai/types";
import { useKanban } from "./KanbanContext.js";

export interface KanbanCardProps {
  job: Job;
}

export function KanbanCard({ job }: KanbanCardProps) {
  const { onSelectJob, onAnalyzeJob, onOpenResume, onApplyJob } = useKanban();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", job.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelectJob(job)}
      className="prism-card rounded-xl p-3.5 flex flex-col gap-2.5 cursor-grab active:cursor-grabbing hover:border-[rgba(255,255,255,0.15)] group"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-[#93c5fd] transition-colors line-clamp-2 leading-relaxed">
          {job.title}
        </h4>
      </div>

      <div className="flex flex-col gap-1 text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <HugeiconsIcon icon={Building02Icon} size={13} className="text-zinc-500 shrink-0" />
          <span className="truncate">{job.company}</span>
        </div>
        {job.location && (
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Location01Icon} size={13} className="text-zinc-500 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
      </div>

      {/* Action Footer depending on current stage */}
      <div
        className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-1.5 mt-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        {job.status === "discovered" && (
          <button
            type="button"
            onClick={() => onAnalyzeJob(job)}
            className="flex items-center gap-1 text-[11px] font-medium text-[#93c5fd] bg-[#142233] hover:bg-[#1a2d44] px-2.5 py-1 rounded-md border border-[#93c5fd]/30 transition-colors cursor-pointer w-full justify-center"
          >
            <HugeiconsIcon icon={SparklesIcon} size={11} />
            <span>Analyze</span>
          </button>
        )}

        {job.status === "analyzed" && (
          <button
            type="button"
            onClick={() => onOpenResume(job)}
            className="flex items-center gap-1 text-[11px] font-medium text-[#d8b4fe] bg-[#251e33] hover:bg-[#312744] px-2.5 py-1 rounded-md border border-[#d8b4fe]/30 transition-colors cursor-pointer w-full justify-center"
          >
            <HugeiconsIcon icon={NoteEditIcon} size={11} />
            <span>Tailor Resume</span>
          </button>
        )}

        {(job.status === "resume_ready" || job.status === "ready_to_apply") && (
          <button
            type="button"
            onClick={() => onApplyJob(job)}
            className="flex items-center gap-1 text-[11px] font-medium text-[#fdba74] bg-[#2e1d13] hover:bg-[#3a2518] px-2.5 py-1 rounded-md border border-[#fdba74]/30 transition-colors cursor-pointer w-full justify-center"
          >
            <HugeiconsIcon icon={AiBrain01Icon} size={11} />
            <span>Launch Agent</span>
          </button>
        )}

        {job.status === "applied" && (
          <span className="text-[10px] font-semibold text-[#a7f3d0] bg-[#142820] px-2 py-0.5 rounded-md border border-[#a7f3d0]/30 w-full text-center">
            ✓ Application Verified
          </span>
        )}

        {job.status === "applying" && (
          <span className="text-[10px] font-semibold text-[#93c5fd] bg-[#142233] px-2 py-0.5 rounded-md border border-[#93c5fd]/30 w-full text-center animate-pulse">
            Agent Navigating...
          </span>
        )}
      </div>
    </div>
  );
}
