import type { AgentRun, CandidateProfile, Job, JobRequirements, JobStatus, ResumeVersion } from "@resume-ai/types";
import React, { useEffect, useState } from "react";
import { apiClient } from "./apiClient.js";
import { AddJobModal } from "./components/AddJobModal.js";
import { AgentMonitorModal } from "./components/AgentMonitorModal.js";
import { CandidateProfileView } from "./components/CandidateProfileView.js";
import { JobModal } from "./components/JobModal.js";
import { KanbanBoard } from "./components/KanbanBoard.js";
import { Layout } from "./components/Layout.js";
import { ResumeEditor } from "./components/ResumeEditor.js";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"kanban" | "jobs" | "profile">("kanban");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);

  // Modals & Active Workspaces
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedJobReqs, setSelectedJobReqs] = useState<JobRequirements | null>(null);
  const [activeResumeJob, setActiveResumeJob] = useState<Job | null>(null);
  const [activeResumeVersion, setActiveResumeVersion] = useState<ResumeVersion | null>(null);
  const [activeAgentJobId, setActiveAgentJobId] = useState<string | null>(null);
  const [activeAgentRun, setActiveAgentRun] = useState<AgentRun | null>(null);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  // Load initial data
  const loadInitialData = async () => {
    try {
      const [candRes, jobsRes] = await Promise.all([apiClient.getCandidate(), apiClient.getJobs()]);
      if (candRes.candidate) setCandidate(candRes.candidate);
      if (jobsRes.jobs) setJobs(jobsRes.jobs);
    } catch {
      // Fallback on initial server launch
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectJob = async (job: Job) => {
    setSelectedJob(job);
    try {
      const details = await apiClient.getJobDetails(job.id);
      setSelectedJobReqs(details.requirements);
    } catch {
      setSelectedJobReqs(null);
    }
  };

  const handleOpenResumeEditor = async (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    setSelectedJob(null);
    setActiveResumeJob(job);

    try {
      const details = await apiClient.getJobDetails(jobId);
      setActiveResumeVersion(details.latestResume);
    } catch {
      setActiveResumeVersion(null);
    }
  };

  const handleOpenAgentRun = async (jobId: string) => {
    setSelectedJob(null);
    setActiveResumeJob(null);
    setActiveAgentJobId(jobId);

    try {
      const res = await apiClient.applyJob(jobId);
      setActiveAgentRun(res.run);
    } catch {
      setActiveAgentRun(null);
    }
  };

  const handleAnalyzeFromModal = async () => {
    if (!selectedJob) return;
    const res = await apiClient.analyzeJob(selectedJob.id);
    setSelectedJob(res.job);
    setSelectedJobReqs(res.requirements);
    setJobs((prev) => prev.map((j) => (j.id === res.job.id ? res.job : j)));
  };

  const handleRegenerateResume = async () => {
    if (!activeResumeJob) return;
    const res = await apiClient.generateResume(activeResumeJob.id);
    setActiveResumeVersion(res.version);
    setActiveResumeJob(res.job);
    setJobs((prev) => prev.map((j) => (j.id === res.job.id ? res.job : j)));
  };

  const handleStatusChange = async (jobId: string, status: JobStatus) => {
    const res = await apiClient.updateJobStatus(jobId, status);
    setJobs((prev) => prev.map((j) => (j.id === jobId ? res.job : j)));
  };

  const handleAddJobSubmit = async (data: {
    title: string;
    company: string;
    description: string;
    url?: string;
    location?: string;
  }) => {
    const res = await apiClient.createJob(data);
    setJobs((prev) => [res.job, ...prev]);
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        setActiveResumeJob(null);
      }}
      candidate={candidate}
      onOpenAddJob={() => setIsAddJobOpen(true)}
    >
      {/* If Resume Editor workspace is open */}
      {activeResumeJob ? (
        <ResumeEditor
          job={activeResumeJob}
          resumeVersion={activeResumeVersion}
          onBack={() => setActiveResumeJob(null)}
          onRegenerate={handleRegenerateResume}
          onApply={() => handleOpenAgentRun(activeResumeJob.id)}
        />
      ) : activeTab === "kanban" ? (
        <KanbanBoard
          jobs={jobs}
          onSelectJob={handleSelectJob}
          onOpenResumeEditor={handleOpenResumeEditor}
          onOpenAgentRun={handleOpenAgentRun}
          onStatusChange={handleStatusChange}
        />
      ) : activeTab === "profile" ? (
        <CandidateProfileView candidate={candidate} />
      ) : (
        /* Jobs List Tab */
        <div className="max-w-4xl mx-auto w-full space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Tracked Job Postings ({jobs.length})
          </h2>
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => handleSelectJob(job)}
              className="flex items-center justify-between p-4 bg-zinc-900/60 hover:bg-zinc-900 rounded-xl border border-zinc-800 transition-all cursor-pointer"
            >
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">{job.title}</h3>
                <p className="text-xs text-zinc-400">
                  {job.company} &middot; {job.location} &middot; Added via {job.source}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="capitalize text-xs font-mono px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {job.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedJob && (
        <JobModal
          job={selectedJob}
          requirements={selectedJobReqs}
          onClose={() => setSelectedJob(null)}
          onAnalyze={handleAnalyzeFromModal}
          onTailorResume={() => handleOpenResumeEditor(selectedJob.id)}
          onApply={() => handleOpenAgentRun(selectedJob.id)}
        />
      )}

      {activeAgentJobId && (
        <AgentMonitorModal
          jobId={activeAgentJobId}
          initialRun={activeAgentRun}
          onClose={() => setActiveAgentJobId(null)}
          onSuccess={() => {
            loadInitialData();
          }}
        />
      )}

      {isAddJobOpen && (
        <AddJobModal
          onClose={() => setIsAddJobOpen(false)}
          onSubmit={handleAddJobSubmit}
        />
      )}
    </Layout>
  );
};
