import type { AgentRun, CandidateProfile, Job, JobRequirements, JobStatus, ResumeVersion } from "@resume-ai/types";

const API_BASE = "/api";

export const apiClient = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json() as Promise<{ status: string; timestamp: string; browserHeadless: boolean }>;
  },

  async getCandidate() {
    const res = await fetch(`${API_BASE}/candidate`);
    return res.json() as Promise<{ candidate: CandidateProfile | null }>;
  },

  async getJobs() {
    const res = await fetch(`${API_BASE}/jobs`);
    return res.json() as Promise<{ jobs: Job[] }>;
  },

  async createJob(data: { title: string; company: string; description: string; url?: string; location?: string }) {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json() as Promise<{ job: Job }>;
  },

  async getJobDetails(id: string) {
    const res = await fetch(`${API_BASE}/jobs/${id}`);
    return res.json() as Promise<{
      job: Job;
      requirements: JobRequirements | null;
      latestResume: ResumeVersion | null;
      runs: AgentRun[];
    }>;
  },

  async updateJobStatus(id: string, status: JobStatus) {
    const res = await fetch(`${API_BASE}/jobs/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return res.json() as Promise<{ job: Job }>;
  },

  async analyzeJob(id: string) {
    const res = await fetch(`${API_BASE}/jobs/${id}/analyze`, {
      method: "POST",
    });
    return res.json() as Promise<{ requirements: JobRequirements; job: Job }>;
  },

  async generateResume(id: string) {
    const res = await fetch(`${API_BASE}/jobs/${id}/resume/generate`, {
      method: "POST",
    });
    return res.json() as Promise<{ version: ResumeVersion; job: Job }>;
  },

  async applyJob(id: string, headless = false) {
    const res = await fetch(`${API_BASE}/jobs/${id}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headless }),
    });
    return res.json() as Promise<{ run: AgentRun }>;
  },

  async resumeAgentRun(runId: string, userInput?: string) {
    const res = await fetch(`${API_BASE}/agent-runs/${runId}/resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userInput }),
    });
    return res.json() as Promise<{ run: AgentRun }>;
  },
};
