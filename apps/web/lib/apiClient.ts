import type {
  AgentRun,
  CandidateProfile,
  ExtractedJobData,
  Job,
  JobPlatformInfo,
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

  async refineResume(resumeId: string, instructions?: string, model?: string) {
    const res = await fetch(`${API_BASE}/resumes/${resumeId}/refine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(instructions ? { instructions } : {}),
        ...(model ? { model } : {}),
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Resume refinement failed with HTTP ${res.status}`);
    }
    return res.json() as Promise<{ version: ResumeVersion }>;
  },

  async extractJobFromUrl(url: string) {
    const res = await fetch(`${API_BASE}/jobs/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to extract job details from URL (HTTP ${res.status})`);
    }
    return res.json() as Promise<{ success: boolean; extracted: ExtractedJobData }>;
  },

  async getSupportedPlatforms() {
    const res = await fetch(`${API_BASE}/jobs/supported-platforms`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to fetch supported platforms");
    }
    return res.json() as Promise<{ platforms: JobPlatformInfo[] }>;
  },

  async getAiModels() {
    const res = await fetch(`${API_BASE}/ai/models`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to fetch AI models");
    }
    return res.json() as Promise<{ defaultModel: string; models: string[] }>;
  },

  async streamAiChat(
    prompt: string,
    options?: { systemPrompt?: string; model?: string; onChunk?: (chunk: string) => void }
  ): Promise<string> {
    const res = await fetch(`${API_BASE}/ai/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        ...(options?.systemPrompt ? { systemPrompt: options.systemPrompt } : {}),
        ...(options?.model ? { model: options.model } : {}),
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Stream failed");
      throw new Error(errorText || `AI streaming failed with HTTP ${res.status}`);
    }

    if (!res.body) {
      throw new Error("ReadableStream is not supported in this environment");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let accumulatedText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      accumulatedText += chunk;
      if (options?.onChunk) {
        options.onChunk(chunk);
      }
    }

    return accumulatedText;
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
