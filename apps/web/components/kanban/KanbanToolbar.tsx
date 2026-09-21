"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useKanban } from "./KanbanContext.js";

export interface KanbanToolbarProps {
  onAddNewJob: () => void;
  className?: string;
}

export function KanbanToolbar({ onAddNewJob, className = "" }: KanbanToolbarProps) {
  const { searchQuery, onSearchChange, jobs } = useKanban();

  const total = jobs.length;
  const appliedCount = jobs.filter((j) => j.status === "applied").length;

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 prism-panel p-4 rounded-xl ${className}`}>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-72">
          <HugeiconsIcon icon={Search01Icon} size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by role or company..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#181b1f] border border-[rgba(255,255,255,0.07)] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#93c5fd]/50 transition-all"
          />
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-zinc-400 px-3 py-2 bg-[#181b1f] rounded-lg border border-[rgba(255,255,255,0.06)] font-mono">
          <span>Total: <strong className="text-zinc-200">{total}</strong></span>
          <span className="text-zinc-600">•</span>
          <span>Applied: <strong className="text-[#a7f3d0]">{appliedCount}</strong></span>
        </div>
      </div>

      <Button
        variant="sky"
        onClick={onAddNewJob}
        className="gap-1.5 text-xs font-semibold"
      >
        <HugeiconsIcon icon={PlusSignIcon} size={14} />
        <span>Add Job Opportunity</span>
      </Button>
    </div>
  );
}
