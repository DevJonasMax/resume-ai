"use client";

import type { AgentRun, CandidateProfile, Job, JobRequirements, JobStatus, ResumeVersion } from "@resume-ai/types";
import {
  Bot,
  Database,
  FileText,
  LayoutDashboard,
  RefreshCw,
  Sparkles,
  UserCheck,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "../lib/apiClient.js";
import { AgentMonitor } from "../components/agent/index.js";
import { CandidateProfileView } from "../components/candidate/CandidateProfileView.js";
import { Kanban } from "../components/kanban/index.js";
import { AddJobModal } from "../components/modals/AddJobModal.js";
import { JobDetailModal } from "../components/modals/JobDetailModal.js";
import { ResumeStudio } from "../components/resume/index.js";

type MainNavTab = "kanban" | "resume" | "candidate";

const KANBAN_STATUSES: JobStatus[] = [
  "discovered",
  "analyzed",
  "resume_ready",
  "ready_to_apply",
  "applying",
  "applied",
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<MainNavTab>("kanban");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Selected items
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedJobReqs, setSelectedJobReqs] = useState<JobRequirements | null>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);

  // Resume Studio state
  const [studioJob, setStudioJob] = useState<Job | null>(null);
  const [studioResume, setStudioResume] = useState<ResumeVersion | null>(null);

  // Agent Monitor state
  const [activeRun, setActiveRun] = useState<AgentRun | null>(null);
  const [isMonitorOpen, setIsMonitorOpen] = useState(false);

  // Initial data load
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [jobsRes, candidateRes, candidatesRes] = await Promise.all([
        apiClient.getJobs(),
        apiClient.getCandidate(),
        apiClient.getCandidates(),
      ]);
      setJobs(jobsRes.jobs || []);
      setCandidate(candidateRes.candidate || null);
      setCandidates(candidatesRes.candidates || []);
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // SSE Stream for Active Agent Run
  useEffect(() => {
    if (!activeRun || activeRun.status === "succeeded" || activeRun.status === "failed") {
      return;
    }

    const eventSource = new EventSource(`/api/agent-runs/${activeRun.id}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const updatedRun = JSON.parse(event.data) as AgentRun;
        setActiveRun(updatedRun);

        if (updatedRun.status === "succeeded" || updatedRun.status === "failed") {
          eventSource.close();
          loadData();
        }
      } catch {
        // Parse error ignore
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [activeRun?.id, activeRun?.status]);

  // Actions
  const handleSelectJob = async (job: Job) => {
    setSelectedJob(job);
    try {
      const details = await apiClient.getJobDetails(job.id);
      setSelectedJobReqs(details.requirements);
      setIsJobDetailOpen(true);
    } catch {
      setIsJobDetailOpen(true);
    }
  };

  const handleMoveJob = async (jobId: string, targetStatus: JobStatus) => {
    try {
      await apiClient.updateJobStatus(jobId, targetStatus);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: targetStatus } : j))
      );
    } catch {
      // Revert or show toast
    }
  };

  const handleAnalyzeJob = async (job: Job) => {
    try {
      const res = await apiClient.analyzeJob(job.id);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? res.job : j)));
      setSelectedJob(res.job);
      setSelectedJobReqs(res.requirements);
      setIsJobDetailOpen(true);
    } catch {
      // Error handling
    }
  };

  const handleOpenResume = async (job: Job) => {
    setStudioJob(job);
    try {
      const details = await apiClient.getJobDetails(job.id);
      if (details.latestResume) {
        setStudioResume(details.latestResume);
      } else {
        const generated = await apiClient.generateResume(job.id);
        setStudioResume(generated.version);
        setJobs((prev) => prev.map((j) => (j.id === job.id ? generated.job : j)));
      }
      setActiveTab("resume");
    } catch {
      setActiveTab("resume");
    }
  };

  const handleRegenerateResume = async () => {
    if (!studioJob) return;
    const generated = await apiClient.generateResume(studioJob.id);
    setStudioResume(generated.version);
    setJobs((prev) => prev.map((j) => (j.id === studioJob.id ? generated.job : j)));
  };

  const handleRefineResume = async (instructions?: string) => {
    if (!studioResume) return;
    const res = await apiClient.refineResume(studioResume.id, instructions);
    setStudioResume(res.version);
  };

  const handleSaveCustomLatex = async (latex: string) => {
    if (!studioResume) return;
    const res = await apiClient.saveResumeLatex(studioResume.id, latex);
    setStudioResume(res.version);
  };

  const handleSelectCandidate = (selected: CandidateProfile) => {
    setCandidate(selected);
  };

  const handleApplyJob = async (job: Job) => {
    try {
      const result = await apiClient.applyJob(job.id);
      setActiveRun(result.run);
      setIsMonitorOpen(true);
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: "applying" } : j))
      );
    } catch {
      // Error handling
    }
  };

  const handleResumeIntervention = async (userInput?: string) => {
    if (!activeRun) return;
    try {
      const result = await apiClient.resumeAgentRun(activeRun.id, userInput);
      setActiveRun(result.run);
    } catch {
      // Error handling
    }
  };

  const handleAddNewJob = async (data: {
    title: string;
    company: string;
    description: string;
    url?: string;
    location?: string;
  }) => {
    const res = await apiClient.createJob(data);
    setJobs((prev) => [res.job, ...prev]);
  };

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      (job.location && job.location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Impeccable Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-600/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  RESUME<span className="text-indigo-400">.AI</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500 block -mt-1">
                  Autonomous Job Agent
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden sm:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800/80">
              <button
                type="button"
                onClick={() => setActiveTab("kanban")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "kanban"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Kanban Pipeline</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!studioJob && jobs.length > 0) {
                    handleOpenResume(jobs[0]);
                  } else {
                    setActiveTab("resume");
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "resume"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Resume Studio</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("candidate")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "candidate"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Candidate Profile</span>
              </button>
            </nav>
          </div>

          {/* Right Header Status */}
          <div className="flex items-center gap-3">
            {activeRun && activeRun.status === "running" && (
              <button
                type="button"
                onClick={() => setIsMonitorOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-bold rounded-lg animate-pulse cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Agent Running</span>
              </button>
            )}

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 text-xs font-medium text-zinc-400">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>SQLite Connected</span>
              <span className="text-zinc-600">•</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Jev AI Ready</span>
            </div>

            <button
              type="button"
              onClick={loadData}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Refresh Pipeline"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Surface */}
      <main
        className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 ${
          activeTab === "resume" ? "max-w-[1680px]" : "max-w-7xl"
        }`}
      >
        {activeTab === "kanban" && (
          <Kanban.Root
            jobs={filteredJobs}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectJob={handleSelectJob}
            onMoveJob={handleMoveJob}
            onAnalyzeJob={handleAnalyzeJob}
            onOpenResume={handleOpenResume}
            onApplyJob={handleApplyJob}
          >
            <Kanban.Toolbar onAddNewJob={() => setIsAddJobOpen(true)} />
            <Kanban.Board>
              {KANBAN_STATUSES.map((status) => {
                const columnJobs = filteredJobs.filter((j) => j.status === status);
                return (
                  <Kanban.Column key={status} status={status} count={columnJobs.length}>
                    {columnJobs.map((job) => (
                      <Kanban.Card key={job.id} job={job} />
                    ))}
                  </Kanban.Column>
                );
              })}
            </Kanban.Board>
          </Kanban.Root>
        )}

        {activeTab === "resume" && (
          studioJob && studioResume ? (
            <ResumeStudio.Root
              job={studioJob}
              resume={studioResume}
              candidate={candidate}
              onRegenerate={handleRegenerateResume}
              onRefineWithAgent={handleRefineResume}
              onSaveCustomLatex={handleSaveCustomLatex}
            >
              <ResumeStudio.Header />
              <ResumeStudio.SplitView />
              <ResumeStudio.DiffDrawer />
              <ResumeStudio.ChatDrawer />
            </ResumeStudio.Root>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center gap-3">
              <FileText className="w-10 h-10 text-zinc-500" />
              <h3 className="text-base font-bold text-white">No Resume Selected</h3>
              <p className="text-xs text-zinc-400 max-w-md">
                Select a job from the Kanban board and click &quot;Tailor Resume&quot; to generate an ATS-tailored LaTeX resume.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("kanban")}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer"
              >
                Go to Kanban Board
              </button>
            </div>
          )
        )}

        {activeTab === "candidate" && (
          <CandidateProfileView
            candidate={candidate}
            candidates={candidates}
            onSelectCandidate={handleSelectCandidate}
            onRefresh={loadData}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      <AddJobModal
        isOpen={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
        onSubmit={handleAddNewJob}
      />

      <JobDetailModal
        job={selectedJob}
        requirements={selectedJobReqs}
        isOpen={isJobDetailOpen}
        onClose={() => setIsJobDetailOpen(false)}
        onAnalyze={handleAnalyzeJob}
        onTailorResume={handleOpenResume}
        onApply={handleApplyJob}
      />

      <AgentMonitor.Root
        isOpen={isMonitorOpen}
        run={activeRun}
        isRunning={activeRun?.status === "running"}
        onClose={() => setIsMonitorOpen(false)}
        onResume={handleResumeIntervention}
      >
        <AgentMonitor.Terminal />
        <AgentMonitor.Intervention />
      </AgentMonitor.Root>
    </div>
  );
}
