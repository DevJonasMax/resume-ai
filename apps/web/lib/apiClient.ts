import type {
  AgentRun,
  CandidateProfile,
  Job,
  JobRequirements,
  JobStatus,
  ResumeDocument,
  ResumeVersion,
} from "@resume-ai/types";

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    return res.json() as Promise<{ requirements: JobRequirements; job: Job }>;
  },

  async generateResume(id: string) {
    const res = await fetch(`${API_BASE}/jobs/${id}/resume/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
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

  async resumeAgentRun(id: string, userInput?: string) {
    const res = await fetch(`${API_BASE}/agent-runs/${id}/resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userInput }),
    });
    return res.json() as Promise<{ run: AgentRun }>;
  },

  async getCandidates() {
    const res = await fetch(`${API_BASE}/candidates`);
    return res.json() as Promise<{ candidates: CandidateProfile[] }>;
  },

  async activateCandidate(id: string) {
    const res = await fetch(`${API_BASE}/candidates/${id}/activate`, {
      method: "PUT",
    });
    return res.json() as Promise<{ candidate: CandidateProfile }>;
  },

  async deleteCandidate(id: string) {
    const res = await fetch(`${API_BASE}/candidates/${id}`, {
      method: "DELETE",
    });
    return res.json() as Promise<{ success: boolean }>;
  },

  async createCandidate(data: Partial<CandidateProfile> & { makeActive?: boolean }) {
    const res = await fetch(`${API_BASE}/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json() as Promise<{ candidate: CandidateProfile }>;
  },

  async importCandidate(data: { text?: string; pdfBase64?: string; makeActive?: boolean }) {
    const res = await fetch(`${API_BASE}/candidates/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json() as Promise<{ candidate: CandidateProfile }>;
  },

  async refineResume(resumeId: string, instructions?: string) {
    const res = await fetch(`${API_BASE}/resumes/${resumeId}/refine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instructions }),
    });
    return res.json() as Promise<{ version: ResumeVersion }>;
  },

  async saveResumeLatex(resumeId: string, latex: string) {
    const res = await fetch(`${API_BASE}/resumes/${resumeId}/latex`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latex }),
    });
    return res.json() as Promise<{ version: ResumeVersion }>;
  },

  getResumePdfUrl(resumeId: string, options?: { provider?: string; paperSize?: string }) {
    const params = new URLSearchParams();
    if (options?.provider) params.set("provider", options.provider);
    if (options?.paperSize) params.set("paperSize", options.paperSize);
    const queryString = params.toString();
    return `${API_BASE}/resumes/${resumeId}/pdf${queryString ? `?${queryString}` : ""}`;
  },

  async getResumeSource(resumeId: string, options?: { provider?: string }) {
    const params = new URLSearchParams();
    if (options?.provider) params.set("provider", options.provider);
    const queryString = params.toString();
    const res = await fetch(`${API_BASE}/resumes/${resumeId}/source${queryString ? `?${queryString}` : ""}`);
    return res.json() as Promise<{ provider: string; source: string }>;
  },

  async saveResumeDocument(resumeId: string, document: ResumeDocument) {
    const res = await fetch(`${API_BASE}/resumes/${resumeId}/document`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document }),
    });
    return res.json() as Promise<{ version: ResumeVersion }>;
  },

  async getProviderConfig() {
    const res = await fetch(`${API_BASE}/config/provider`);
    return res.json() as Promise<{ activeProvider: "typst" | "react-pdf" | "latex" }>;
  },
};
