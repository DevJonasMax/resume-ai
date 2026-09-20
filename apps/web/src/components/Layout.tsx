import type { CandidateProfile } from "@resume-ai/types";
import { Briefcase, CheckCircle, LayoutDashboard, Plus, Sparkles, Terminal, User } from "lucide-react";
import React from "react";

interface LayoutProps {
  activeTab: "kanban" | "jobs" | "profile";
  onTabChange: (tab: "kanban" | "jobs" | "profile") => void;
  candidate: CandidateProfile | null;
  onOpenAddJob: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeTab,
  onTabChange,
  candidate,
  onOpenAddJob,
  children,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight flex items-center gap-2">
              AI Job Application Agent
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                MVP
              </span>
            </h1>
            <p className="text-xs text-zinc-400">Jev System One &middot; agent-browser &middot; LaTeX Tailoring</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-zinc-900/60 p-1 rounded-lg border border-zinc-800/80">
          <button
            onClick={() => onTabChange("kanban")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "kanban"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Kanban Pipeline
          </button>
          <button
            onClick={() => onTabChange("jobs")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "jobs"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            All Opportunities
          </button>
          <button
            onClick={() => onTabChange("profile")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "profile"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Profile &amp; Base CV
          </button>
        </nav>

        {/* Action Controls & Candidate Indicator */}
        <div className="flex items-center gap-3">
          {candidate && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{candidate.fullName}</span>
            </div>
          )}

          <button
            onClick={onOpenAddJob}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Job
          </button>
        </div>
      </header>

      {/* Main Body View */}
      <main className="flex-1 flex flex-col p-6 overflow-hidden">{children}</main>
    </div>
  );
};
