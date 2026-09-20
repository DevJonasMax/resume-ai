"use client";

import type { JobStatus } from "@resume-ai/types";
import React, { useState } from "react";
import { useKanban } from "./KanbanContext.js";

const COLUMN_META: Record<
  JobStatus,
  { title: string; color: string; badgeColor: string; bgTint: string }
> = {
  discovered: {
    title: "Discovered",
    color: "text-zinc-400",
    badgeColor: "bg-zinc-800 text-zinc-300 border-zinc-700",
    bgTint: "border-zinc-800/80",
  },
  analyzed: {
    title: "Analyzed",
    color: "text-blue-400",
    badgeColor: "bg-blue-950/60 text-blue-300 border-blue-800/60",
    bgTint: "border-blue-900/30",
  },
  resume_ready: {
    title: "Resume Ready",
    color: "text-purple-400",
    badgeColor: "bg-purple-950/60 text-purple-300 border-purple-800/60",
    bgTint: "border-purple-900/30",
  },
  ready_to_apply: {
    title: "Ready to Apply",
    color: "text-amber-400",
    badgeColor: "bg-amber-950/60 text-amber-300 border-amber-800/60",
    bgTint: "border-amber-900/30",
  },
  applying: {
    title: "Applying",
    color: "text-cyan-400",
    badgeColor: "bg-cyan-950/60 text-cyan-300 border-cyan-800/60",
    bgTint: "border-cyan-900/30",
  },
  applied: {
    title: "Applied",
    color: "text-emerald-400",
    badgeColor: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60",
    bgTint: "border-emerald-900/30",
  },
  interview: {
    title: "Interview",
    color: "text-emerald-400",
    badgeColor: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60",
    bgTint: "border-emerald-900/30",
  },
  archived: {
    title: "Archived",
    color: "text-zinc-500",
    badgeColor: "bg-zinc-800 text-zinc-400 border-zinc-700",
    bgTint: "border-zinc-800/40",
  },
};

export interface KanbanColumnProps {
  status: JobStatus;
  children: React.ReactNode;
  count: number;
}

export function KanbanColumn({ status, children, count }: KanbanColumnProps) {
  const meta = COLUMN_META[status];
  const { onMoveJob } = useKanban();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const jobId = e.dataTransfer.getData("text/plain");
    if (jobId) {
      await onMoveJob(jobId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-xl p-3 bg-zinc-900/50 border transition-all ${meta.bgTint} ${
        isDragOver ? "ring-2 ring-indigo-500/80 bg-zinc-800/60 scale-[1.01]" : ""
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>
            {meta.title}
          </span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${meta.badgeColor}`}>
          {count}
        </span>
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
