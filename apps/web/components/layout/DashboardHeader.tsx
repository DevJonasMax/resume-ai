"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  FlashIcon,
  ReloadIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import type { AgentRun } from "@resume-ai/types";
import { Button } from "@/components/ui/button";
import type { NavTab } from "./DashboardSidebar";

export interface DashboardHeaderProps {
  activeTab: NavTab;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  activeRun: AgentRun | null;
  onOpenMonitor: () => void;
}

const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
  resume: {
    title: "Resume Studio",
    subtitle: "Interactive LaTeX editor, ATS tailoring rationale inspector, and live PDF rendering",
  },
  kanban: {
    title: "Kanban Pipeline",
    subtitle: "End-to-end recruitment funnel tracking with automated state transitions",
  },
  candidate: {
    title: "Candidate Profiles",
    subtitle: "Grounded truth profiles used for verifiable ATS tailoring without hallucinations",
  },
  monitor: {
    title: "Agent Execution Monitor",
    subtitle: "Real-time SSE event stream and human-in-the-loop intervention terminal",
  },
};

export function DashboardHeader({
  activeTab,
  searchQuery,
  onSearchChange,
  onRefresh,
  isLoading = false,
  activeRun,
  onOpenMonitor,
}: DashboardHeaderProps) {
  const current = tabTitles[activeTab];

  return (
    <header className="h-16 shrink-0 border-b border-[rgba(255,255,255,0.07)] bg-[#0c0d0e]/95 px-6 flex items-center justify-between gap-4 backdrop-blur-xs">
      {/* Title & Context */}
      <div className="flex flex-col min-w-0">
        <h1 className="text-sm font-bold text-white tracking-tight truncate">
          {current.title}
        </h1>
        <p className="text-[11px] text-zinc-400 truncate hidden sm:block">
          {current.subtitle}
        </p>
      </div>

      {/* Actions & Global Search */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search Input */}
        <div className="relative w-48 sm:w-64">
          <HugeiconsIcon
            icon={Search01Icon}
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search opportunities..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-[#121417] text-zinc-200 placeholder:text-zinc-500 rounded-lg border border-[rgba(255,255,255,0.08)] outline-none focus:border-[#93c5fd]/50 transition-colors"
          />
        </div>

        {/* In-Flight Agent Indicator */}
        {activeRun && activeRun.status === "running" && (
          <button
            type="button"
            onClick={onOpenMonitor}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#142820] border border-[#a7f3d0]/30 text-[#a7f3d0] text-xs font-semibold rounded-lg cursor-pointer hover:bg-[#1a342a] transition-colors"
          >
            <HugeiconsIcon icon={FlashIcon} size={14} className="animate-pulse" />
            <span className="hidden md:inline">Agent Running</span>
          </button>
        )}

        {/* Pipeline Refresh Button */}
        <Button
          variant="secondary"
          size="icon"
          onClick={onRefresh}
          title="Refresh Workspace Data"
          disabled={isLoading}
        >
          <HugeiconsIcon
            icon={ReloadIcon}
            size={14}
            className={isLoading ? "animate-spin text-zinc-400" : "text-zinc-300"}
          />
        </Button>
      </div>
    </header>
  );
}
