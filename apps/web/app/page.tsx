"use client";

import type {
  AgentRun,
  CandidateProfile,
  Job,
  JobRequirements,
  JobStatus,
  ResumeVersion,
} from "@resume-ai/types";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  NoteEditIcon,
  ReloadIcon,
} from "@hugeicons/core-free-icons";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../lib/apiClient.js";
import { AgentMonitor } from "../components/agent/index.js";
import { CandidateProfileView } from "../components/candidate/CandidateProfileView.js";
import { Kanban } from "../components/kanban/index.js";
import {
  DashboardHeader,
  DashboardSidebar,
  type NavTab,
} from "../components/layout/index.js";
import { AddJobModal } from "../components/modals/AddJobModal.js";
import { ImportCandidateModal } from "../components/modals/ImportCandidateModal.js";
import { JobDetailModal } from "../components/modals/JobDetailModal.js";
import { ResumeStudio } from "../components/resume/index.js";
import { Button } from "@/components/ui/button";

const KANBAN_STATUSES: JobStatus[] = [
  "discovered",
  "analyzed",
  "resume_ready",
  "ready_to_apply",
  "applying",
  "applied",
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("resume_ai_active_tab") as NavTab | null;
      if (saved && ["resume", "kanban", "candidate", "monitor"].includes(saved)) {
        return saved;
      }
    }
    return "resume";
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Selected items
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [isImportCandidateOpen, setIsImportCandidateOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedJobReqs, setSelectedJobReqs] = useState<JobRequirements | null>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);

  // Resume Studio state
  const [studioJob, setStudioJob] = useState<Job | null>(null);
  const [studioResume, setStudioResume] = useState<ResumeVersion | null>(null);
  const [isStudioLoading, setIsStudioLoading] = useState(false);

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

      if (jobsRes.jobs && jobsRes.jobs.length > 0 && !studioJob) {
        const firstJob = jobsRes.jobs[0];
        setStudioJob(firstJob);
        try {
          const details = await apiClient.getJobDetails(firstJob.id);
          if (details.latestResume) {
            setStudioResume(details.latestResume);
          }
        } catch {
          // Ignore prefetch error
        }
      }
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

  // Defensive sanitization of jobs
  const safeJobs = useMemo(
    () =>
      (jobs || []).filter(
        (j): j is Job => Boolean(j && typeof j === "object" && j.id && j.status)
      ),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return safeJobs;
    const q = searchQuery.toLowerCase();
    return safeJobs.filter(
      (job) =>
        (job.title && job.title.toLowerCase().includes(q)) ||
        (job.company && job.company.toLowerCase().includes(q)) ||
        (job.location && job.location.toLowerCase().includes(q))
    );
  }, [safeJobs, searchQuery]);

  // Auto-load candidate fallback
  useEffect(() => {
    if (!candidate && candidates.length > 0) {
      setCandidate(candidates[0]);
    }
  }, [candidate, candidates]);

  // In-studio auto-selection: if studio tab is active and no job selected, auto-select first available job
  useEffect(() => {
    if (activeTab === "resume" && !studioJob && safeJobs.length > 0) {
      handleOpenResume(safeJobs[0]);
    }
  }, [activeTab, studioJob, safeJobs]);

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
        prev.map((j) => (j && j.id === jobId ? { ...j, status: targetStatus } : j))
      );
    } catch {
      // Revert or show toast
    }
  };

  const handleAnalyzeJob = async (job: Job) => {
    try {
      const res = await apiClient.analyzeJob(job.id);
      setJobs((prev) => prev.map((j) => (j && j.id === job.id ? res.job : j)));
      setSelectedJob(res.job);
      setSelectedJobReqs(res.requirements);
      setIsJobDetailOpen(true);
    } catch {
      // Error handling
    }
  };

  const handleOpenResume = async (job: Job) => {
    setStudioJob(job);
    setIsStudioLoading(true);
    try {
      const details = await apiClient.getJobDetails(job.id);
      if (details.latestResume) {
        setStudioResume(details.latestResume);
      } else {
        const generated = await apiClient.generateResume(job.id);
        setStudioResume(generated.version);
        setJobs((prev) => prev.map((j) => (j && j.id === job.id ? generated.job : j)));
      }
      setActiveTab("resume");
    } catch {
      setActiveTab("resume");
    } finally {
      setIsStudioLoading(false);
    }
  };

  const handleRegenerateResume = async () => {
    if (!studioJob) return;
    const generated = await apiClient.generateResume(studioJob.id);
    setStudioResume(generated.version);
    setJobs((prev) => prev.map((j) => (j && j.id === studioJob.id ? generated.job : j)));
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
        prev.map((j) => (j && j.id === job.id ? { ...j, status: "applying" } : j))
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

  const handleTabChange = (tab: NavTab) => {
    if (tab === "monitor") {
      setIsMonitorOpen(true);
      return;
    }
    if (tab === "resume" && !studioJob && safeJobs.length > 0) {
      handleOpenResume(safeJobs[0]);
    }
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      localStorage.setItem("resume_ai_active_tab", tab);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0c0d0e] text-[#ededed] overflow-hidden select-none">
      {/* Fixed Left Navigation Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        jobsCount={safeJobs.length}
        candidatesCount={candidates.length}
        activeCandidate={candidate}
        activeJob={studioJob || selectedJob}
        onOpenAddJob={() => setIsAddJobOpen(true)}
        onOpenImportCandidate={() => setIsImportCandidateOpen(true)}
        isAgentRunning={activeRun?.status === "running"}
        onOpenMonitor={() => setIsMonitorOpen(true)}
      />

      {/* Main Viewport Shell */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0c0d0e]">
        {/* Top Header */}
        <DashboardHeader
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={loadData}
          isLoading={isLoading}
          activeRun={activeRun}
          onOpenMonitor={() => setIsMonitorOpen(true)}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6 bg-[#0c0d0e]">
          {activeTab === "kanban" && (
            <div className="max-w-[1720px] mx-auto">
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
                    const columnJobs = filteredJobs.filter((j) => j?.status === status);
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
            </div>
          )}

          {activeTab === "resume" && (
            <div className="max-w-[1720px] mx-auto">
              {studioJob && studioResume ? (
                <ResumeStudio.Root
                  job={studioJob}
                  resume={studioResume}
                  candidate={candidate}
                  allJobs={safeJobs}
                  allCandidates={candidates}
                  onSelectJob={handleOpenResume}
                  onSelectCandidate={handleSelectCandidate}
                  onRegenerate={handleRegenerateResume}
                  onRefineWithAgent={handleRefineResume}
                  onSaveCustomLatex={handleSaveCustomLatex}
                >
                  <ResumeStudio.Header />
                  <ResumeStudio.SplitView />
                  <ResumeStudio.DiffDrawer />
                  <ResumeStudio.ChatDock />
                </ResumeStudio.Root>
              ) : (
                <div className="bg-[#121417] border border-[rgba(255,255,255,0.07)] rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 min-h-[420px]">
                  <div className="w-12 h-12 rounded-xl bg-[#181b1f] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#d8b4fe]">
                    <HugeiconsIcon
                      icon={isStudioLoading ? ReloadIcon : NoteEditIcon}
                      size={22}
                      className={isStudioLoading ? "animate-spin text-[#d8b4fe]" : ""}
                    />
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    {isStudioLoading ? "Generating Tailored Resume..." : "No Opportunity Selected"}
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                    {isStudioLoading
                      ? "Synthesizing ATS-targeted LaTeX source with grounded candidate profile facts..."
                      : "Select a job opportunity from the pipeline or the studio selector above to generate and inspect an ATS-tailored LaTeX resume."}
                  </p>
                  {!isStudioLoading && safeJobs.length > 0 && (
                    <Button
                      variant="lavender"
                      size="sm"
                      onClick={() => handleOpenResume(safeJobs[0])}
                      className="mt-2 text-xs"
                    >
                      Open First Opportunity ({safeJobs[0].title})
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "candidate" && (
            <div className="max-w-[1720px] mx-auto">
              <CandidateProfileView
                candidate={candidate}
                candidates={candidates}
                onSelectCandidate={handleSelectCandidate}
                onRefresh={loadData}
              />
            </div>
          )}
        </main>
      </div>

      {/* Global Modals & Dialogs */}
      <AddJobModal
        isOpen={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
        onSubmit={handleAddNewJob}
      />

      <ImportCandidateModal
        isOpen={isImportCandidateOpen}
        onClose={() => setIsImportCandidateOpen(false)}
        onSuccess={async (newCandidate) => {
          setCandidate(newCandidate);
          await loadData();
        }}
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
