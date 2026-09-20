"use client";

import { Plus, Search } from "lucide-react";
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
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 rounded-xl ${className}`}>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by role or company..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900/80 border border-zinc-700/60 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-zinc-400 px-3 py-2 bg-zinc-800/60 rounded-lg border border-zinc-700/40">
          <span>Total: <strong className="text-zinc-200">{total}</strong></span>
          <span className="text-zinc-600">•</span>
          <span>Applied: <strong className="text-emerald-400">{appliedCount}</strong></span>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddNewJob}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Add Job Opportunity</span>
      </button>
    </div>
  );
}
