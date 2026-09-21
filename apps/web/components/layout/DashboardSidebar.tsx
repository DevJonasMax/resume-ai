"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiBrain01Icon,
  CheckmarkCircle02Icon,
  DashboardSquare01Icon,
  Database01Icon,
  FlashIcon,
  NoteEditIcon,
  PlusSignIcon,
  SparklesIcon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons";
import type { CandidateProfile, Job } from "@resume-ai/types";
import { Badge } from "@/components/ui/badge";

export type NavTab = "resume" | "kanban" | "candidate" | "monitor";

export interface DashboardSidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  jobsCount: number;
  candidatesCount: number;
  activeCandidate: CandidateProfile | null;
  activeJob: Job | null;
  onOpenAddJob: () => void;
  onOpenImportCandidate: () => void;
  isAgentRunning?: boolean;
  onOpenMonitor: () => void;
}

export function DashboardSidebar({
  activeTab,
  onTabChange,
  jobsCount,
  candidatesCount,
  activeCandidate,
  activeJob,
  onOpenAddJob,
  onOpenImportCandidate,
  isAgentRunning = false,
  onOpenMonitor,
}: DashboardSidebarProps) {
  const navItems = [
    {
      id: "resume" as const,
      label: "Resume Studio",
      description: "LaTeX & ATS synthesis",
      icon: NoteEditIcon,
      badge: "Workstation",
      badgeVariant: "lavender" as const,
    },
    {
      id: "kanban" as const,
      label: "Kanban Pipeline",
      description: `${jobsCount} active opportunities`,
      icon: DashboardSquare01Icon,
      count: jobsCount,
    },
    {
      id: "candidate" as const,
      label: "Candidate Profiles",
      description: `${candidatesCount} verified truth profiles`,
      icon: UserAccountIcon,
      count: candidatesCount,
    },
  ];

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full bg-[#0c0d0e] border-r border-[rgba(255,255,255,0.07)] select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#181b1f] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#d8b4fe]">
            <HugeiconsIcon icon={AiBrain01Icon} size={16} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight text-white font-mono">
                RESUME<span className="text-[#a7f3d0]">.AI</span>
              </span>
              <Badge variant="lavender" className="text-[9px] px-1.5 py-0 h-4 uppercase">
                Prism
              </Badge>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              Autonomous Agent
            </span>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <span className="px-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
          Workspaces
        </span>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-[#181b1f] text-white border border-[rgba(255,255,255,0.08)] shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-[#121417]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <HugeiconsIcon
                  icon={item.icon}
                  size={16}
                  className={isActive ? "text-[#a7f3d0]" : "text-zinc-500"}
                />
                <div className="flex flex-col text-left truncate">
                  <span className="truncate leading-snug">{item.label}</span>
                </div>
              </div>

              {item.badge && (
                <Badge variant={item.badgeVariant} className="text-[9px] px-1.5 py-0">
                  {item.badge}
                </Badge>
              )}

              {typeof item.count === "number" && !item.badge && (
                <span className="text-[10px] font-mono text-zinc-500 bg-[#121417] px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.05)]">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Agent Monitor trigger item */}
        <div className="pt-3">
          <span className="px-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
            Execution
          </span>
          <button
            type="button"
            onClick={onOpenMonitor}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isAgentRunning
                ? "bg-[#142820] text-[#a7f3d0] border border-[#a7f3d0]/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-[#121417]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <HugeiconsIcon
                icon={isAgentRunning ? FlashIcon : AiBrain01Icon}
                size={16}
                className={isAgentRunning ? "text-[#a7f3d0] animate-pulse" : "text-zinc-500"}
              />
              <span className="truncate">Agent Monitor</span>
            </div>
            {isAgentRunning ? (
              <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-[#a7f3d0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a7f3d0] animate-ping" />
                ACTIVE
              </span>
            ) : (
              <span className="text-[10px] font-mono text-zinc-600">Idle</span>
            )}
          </button>
        </div>

        {/* Active Context Card */}
        <div className="pt-4">
          <div className="p-3 bg-[#121417] rounded-xl border border-[rgba(255,255,255,0.06)] flex flex-col gap-2.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <HugeiconsIcon icon={SparklesIcon} size={12} className="text-[#d8b4fe]" />
              Active Target
            </span>

            {/* Candidate & Target Job Info */}
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-zinc-200 truncate">
                  {activeCandidate?.fullName || "No candidate selected"}
                </span>
                <span className="text-[10px] text-zinc-500 truncate">
                  {activeCandidate?.location || "No profile location"}
                </span>
              </div>
              {activeJob && (
                <div className="pt-1 border-t border-[rgba(255,255,255,0.04)] flex flex-col">
                  <span className="text-[11px] font-medium text-zinc-300 truncate">
                    {activeJob.title}
                  </span>
                  <span className="text-[10px] text-[#93c5fd] truncate">
                    {activeJob.company}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[rgba(255,255,255,0.06)]">
              <button
                type="button"
                onClick={onOpenAddJob}
                className="flex items-center justify-center gap-1 py-1 px-1.5 rounded bg-[#181b1f] hover:bg-[#20242a] text-[10px] font-medium text-zinc-300 transition-colors cursor-pointer border border-[rgba(255,255,255,0.06)]"
              >
                <HugeiconsIcon icon={PlusSignIcon} size={11} className="text-[#93c5fd]" />
                <span>Job</span>
              </button>

              <button
                type="button"
                onClick={onOpenImportCandidate}
                className="flex items-center justify-center gap-1 py-1 px-1.5 rounded bg-[#181b1f] hover:bg-[#20242a] text-[10px] font-medium text-zinc-300 transition-colors cursor-pointer border border-[rgba(255,255,255,0.06)]"
              >
                <HugeiconsIcon icon={PlusSignIcon} size={11} className="text-[#d8b4fe]" />
                <span>Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Telemetry Footer */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.06)] bg-[#0c0d0e] flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Database01Icon} size={12} className="text-[#a7f3d0]" />
            <span>SQLite DB</span>
          </span>
          <span className="flex items-center gap-1 text-[#a7f3d0]">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={10} />
            <span>Synced</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5">
            <HugeiconsIcon icon={SparklesIcon} size={12} className="text-[#d8b4fe]" />
            <span>Jev System One</span>
          </span>
          <span className="text-[#d8b4fe]">Ready</span>
        </div>
      </div>
    </aside>
  );
}
