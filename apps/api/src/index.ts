import cors from "@fastify/cors";
import { ApplicationLifecycleManager } from "@resume-ai/applications";
import { ApplicationAgentRunner } from "@resume-ai/browser";
import { appConfig } from "@resume-ai/config";
import { getAIProvider, getAssistantEngine, NON_DEPRECATED_GEMINI_MODELS, type AssistantContext } from "@resume-ai/ai";
import {
  AgentRunRepository,
  ApplicationRepository,
  CandidateRepository,
  JobRepository,
  ResumeRepository,
  seedDatabase,
} from "@resume-ai/database";
import { JobAnalysisService, JobExtractionService, getSupportedPlatformsList } from "@resume-ai/jobs";
import { CandidateParserService, getPDFProvider, ResumeTailoringService } from "@resume-ai/resume";
import {
  type CandidateProfile,
  type Job,
  type JobStatus,
  ResumeDocumentSchema,
  type ResumeDocument,
  type ResumeVersion,
} from "@resume-ai/types";
import Fastify from "fastify";

const server = Fastify({
  logger: true,
});

await server.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

// Domain repositories and services
const jobRepo = new JobRepository();
const resumeRepo = new ResumeRepository();
const appRepo = new ApplicationRepository();
const runRepo = new AgentRunRepository();
const candidateRepo = new CandidateRepository();

const analysisService = new JobAnalysisService(jobRepo, candidateRepo);
const tailoringService = new ResumeTailoringService(jobRepo, candidateRepo, resumeRepo);
const candidateParser = new CandidateParserService();
const jobExtractionService = new JobExtractionService();
const agentRunner = new ApplicationAgentRunner(undefined, undefined, jobRepo, candidateRepo, resumeRepo, runRepo);
const lifecycle = new ApplicationLifecycleManager(jobRepo, appRepo);

// Seed on server boot if candidate profile does not exist
const activeProfile = await candidateRepo.getActiveProfile();
if (!activeProfile) {
  await seedDatabase();
}

/**
 * Health check endpoint.
 */
server.get("/api/health", async () => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: appConfig.nodeEnv,
    browserHeadless: appConfig.browserHeadless,
  };
});

/**
 * List all candidate profiles.
 */
server.get("/api/candidates", async () => {
  const candidates = await candidateRepo.getAllProfiles();
  return { candidates };
});

/**
 * Get active candidate profile.
 */
server.get("/api/candidate", async () => {
  const candidate = await candidateRepo.getActiveProfile();
  return { candidate };
});

/**
 * Activate a candidate profile.
 */
server.put("/api/candidates/:id/activate", async (request, reply) => {
  const { id } = request.params as { id: string };
  const activated = await candidateRepo.setActiveProfile(id);
  if (!activated) {
    return reply.status(404).send({ error: "Candidate profile not found" });
  }
  return { candidate: activated };
});

/**
 * Delete a candidate profile.
 */
server.delete("/api/candidates/:id", async (request) => {
  const { id } = request.params as { id: string };
  await candidateRepo.deleteProfile(id);
  return { success: true };
});

/**
 * Manually create a candidate profile.
 */
server.post("/api/candidates", async (request, reply) => {
  const body = request.body as Partial<CandidateProfile> & { makeActive?: boolean };
  if (!body.fullName || !body.email) {
    return reply.status(400).send({ error: "Missing required fields: fullName, email" });
  }

  const now = new Date().toISOString();
  const newCandidate: CandidateProfile = {
    id: `candidate-${Date.now()}`,
    fullName: body.fullName,
    email: body.email,
    phone: body.phone || "",
    location: body.location || "Remote",
    summary: body.summary || "",
    skills: body.skills || { "Core Skills": [] },
    experiences: body.experiences || [],
    education: body.education || [],
    isActive: body.makeActive ?? true,
    createdAt: now,
    updatedAt: now,
  };

  await candidateRepo.save(newCandidate);
  if (body.makeActive ?? true) {
    await candidateRepo.setActiveProfile(newCandidate.id);
  }

  return reply.status(201).send({ candidate: newCandidate });
});

/**
 * Import and parse candidate profile from text or PDF buffer.
 */
server.post("/api/candidates/import", async (request, reply) => {
  const body = request.body as {
    text?: string;
    pdfBase64?: string;
    makeActive?: boolean;
  };

  try {
    let parsedData;
    if (body.pdfBase64) {
      const buffer = Buffer.from(body.pdfBase64, "base64");
      parsedData = await candidateParser.parseFromPdf(buffer);
    } else if (body.text && body.text.trim().length > 0) {
      parsedData = await candidateParser.parseFromText(body.text);
    } else {
      return reply.status(400).send({ error: "Either text or pdfBase64 must be provided for import" });
    }

    const now = new Date().toISOString();
    const candidate: CandidateProfile = {
      id: `candidate-${Date.now()}`,
      ...parsedData,
      isActive: body.makeActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    await candidateRepo.save(candidate);
    if (body.makeActive ?? true) {
      await candidateRepo.setActiveProfile(candidate.id);
    }

    return reply.status(201).send({ candidate });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return reply.status(500).send({ error: message });
  }
});

/**
 * List all jobs.
 */
server.get("/api/jobs", async () => {
  const jobs = await jobRepo.findAll();
  return { jobs };
});

/**
 * Create a new job.
 */
server.post("/api/jobs", async (request, reply) => {
  const body = request.body as {
    title: string;
    company: string;
    description: string;
    url?: string;
    location?: string;
    source?: string;
  };

  if (!body.title || !body.company || !body.description) {
    return reply.status(400).send({ error: "Missing required fields: title, company, description" });
  }

  const now = new Date().toISOString();
  const newJob: Job = {
    id: `job-${Date.now()}`,
    title: body.title,
    company: body.company,
    url: body.url || "",
    location: body.location || "Remote",
    source: body.source || "manual",
    description: body.description,
    status: "discovered",
    createdAt: now,
    updatedAt: now,
  };

  await jobRepo.save(newJob);
  return reply.status(201).send({ job: newJob });
});

/**
 * List supported job recruitment platforms.
 */
server.get("/api/jobs/supported-platforms", async () => {
  return { platforms: getSupportedPlatformsList() };
});

/**
 * Extract job details from a live URL across supported platforms.
 */
server.post("/api/jobs/extract", async (request, reply) => {
  const body = request.body as { url?: string };
  if (!body.url || !body.url.trim()) {
    return reply.status(400).send({ error: "Missing required parameter: url" });
  }

  try {
    const extracted = await jobExtractionService.extractFromUrl(body.url.trim());
    return { success: true, extracted };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    server.log.error(`Job extraction failed for ${body.url}: ${message}`);
    return reply.status(400).send({ error: message });
  }
});

/**
 * Get job details with requirements, latest resume, and application state.
 */
server.get("/api/jobs/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const job = await jobRepo.findById(id);
  if (!job) {
    return reply.status(404).send({ error: "Job not found" });
  }

  const requirements = await jobRepo.getRequirements(id);
  const latestResume = await resumeRepo.getLatestVersion(id);
  const application = await appRepo.findByJobId(id);
  const runs = await runRepo.findByJobId(id);

  return {
    job,
    requirements,
    latestResume,
    application,
    runs,
  };
});

/**
 * Update job status (e.g. from Kanban drag-and-drop).
 */
server.put("/api/jobs/:id/status", async (request, reply) => {
  const { id } = request.params as { id: string };
  const { status } = request.body as { status: JobStatus };

  try {
    await lifecycle.transition(id, status);
    const updated = await jobRepo.findById(id);
    return { job: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return reply.status(400).send({ error: message });
  }
});

/**
 * Trigger AI job requirement extraction and gap analysis.
 */
server.post("/api/jobs/:id/analyze", async (request, reply) => {
  const { id } = request.params as { id: string };
  try {
    const requirements = await analysisService.analyzeJob(id);
    const updatedJob = await jobRepo.findById(id);
    return { requirements, job: updatedJob };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return reply.status(500).send({ error: message });
  }
});

/**
 * Generate tailored LaTeX resume version.
 */
server.post("/api/jobs/:id/resume/generate", async (request, reply) => {
  const { id } = request.params as { id: string };
  try {
    const existingReqs = await jobRepo.getRequirements(id);
    if (!existingReqs) {
      await analysisService.analyzeJob(id);
    }
    const version = await tailoringService.generateTailoredResume(id);
    const updatedJob = await jobRepo.findById(id);
    return { version, job: updatedJob };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return reply.status(500).send({ error: message });
  }
});

/**
 * Get latest resume version.
 */
server.get("/api/jobs/:id/resume/latest", async (request, reply) => {
  const { id } = request.params as { id: string };
  const resume = await resumeRepo.getLatestVersion(id);
  if (!resume) {
    return reply.status(404).send({ error: "No tailored resume found for this job" });
  }
  return { resume };
});

/**
 * Refine an existing resume version with the AI Agent.
 */
server.post("/api/resumes/:id/refine", async (request, reply) => {
  const { id } = request.params as { id: string };
  const body = (request.body as { instructions?: string; model?: string }) || {};
  try {
    const result = await tailoringService.refineResumeWithAgent(id, body.instructions, body.model);
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    server.log.error(`Resume refinement error for resume ${id}: ${message}`);
    return reply.status(500).send({ error: message });
  }
});

/**
 * List available non-deprecated Gemini models and current default.
 */
server.get("/api/ai/models", async () => {
  const provider = getAIProvider();
  return {
    defaultModel: appConfig.geminiModel,
    models: NON_DEPRECATED_GEMINI_MODELS,
    isMock: provider.isMock ?? false,
  };
});

/**
 * Real-time AI chat text streaming endpoint for assistant dialogue.
 * Strictly bounded to candidate profile enhancement, resume ATS tailoring, and browser application readiness.
 */
server.post("/api/ai/chat/stream", async (request, reply) => {
  const body = (request.body as {
    prompt?: string;
    systemPrompt?: string;
    model?: string;
    context?: AssistantContext;
  }) || {};

  if (!body.prompt || !body.prompt.trim()) {
    return reply.status(400).send({ error: "Missing required parameter: prompt" });
  }

  try {
    const assistantEngine = getAssistantEngine();

    // Augment context if jobId is present
    let context = body.context;
    if (body.context?.jobId && !body.context.jobTitle) {
      const job = await jobRepo.findById(body.context.jobId);
      const candidate = await candidateRepo.getActiveProfile();
      const latestResume = await resumeRepo.getLatestVersion(body.context.jobId);
      if (job) {
        context = {
          ...context,
          jobTitle: job.title,
          company: job.company,
          jobDescription: job.description,
          ...(candidate?.fullName ? { candidateName: candidate.fullName } : {}),
          ...(candidate?.summary ? { candidateSummary: candidate.summary } : {}),
          ...(latestResume?.tailoredSummary ? { currentResumeSummary: latestResume.tailoredSummary } : {}),
        };
      }
    }

    const textStream = await assistantEngine.stream({
      prompt: body.prompt.trim(),
      ...(body.systemPrompt ? { systemPrompt: body.systemPrompt } : {}),
      ...(body.model ? { model: body.model } : {}),
      context,
    });

    reply.raw.setHeader("Content-Type", "text/plain; charset=utf-8");
    reply.raw.setHeader("Transfer-Encoding", "chunked");
    reply.raw.setHeader("Access-Control-Allow-Origin", "*");

    for await (const chunk of textStream) {
      reply.raw.write(chunk);
    }
    reply.raw.end();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    server.log.error(`AI Streaming failure: ${message}`);
    reply.raw.statusCode = 500;
    reply.raw.write(message);
    reply.raw.end();
  }
});


/**
 * Helper to ensure a ResumeDocument is returned, with fallback reconstruction for legacy rows.
 */
async function resolveResumeDocument(resume: ResumeVersion): Promise<ResumeDocument> {
  if (resume.resumeData) {
    return resume.resumeData;
  }
  const candidate = await candidateRepo.getActiveProfile();
  const skills = candidate
    ? Object.entries(candidate.skills).map(([category, items]) => ({ category, items }))
    : [];
  return {
    basics: {
      fullName: candidate?.fullName || "Candidate",
      email: candidate?.email || "candidate@example.com",
      phone: candidate?.phone || "",
      location: candidate?.location || "",
    },
    summary: resume.tailoredSummary,
    experiences: resume.tailoredExperience,
    skills,
    education: candidate?.education || [],
  };
}

/**
 * Get active PDF provider configuration.
 */
server.get("/api/config/provider", async () => {
  return { activeProvider: appConfig.pdfProvider };
});

/**
 * Stream compiled PDF for a specific resume version using the active or requested provider.
 */
server.get("/api/resumes/:id/pdf", async (request, reply) => {
  const { id } = request.params as { id: string };
  const query = request.query as { paperSize?: "letter" | "a4"; provider?: "typst" | "react-pdf" | "latex" };
  const resume = await resumeRepo.findById(id);
  if (!resume) {
    return reply.status(404).send({ error: "Resume version not found" });
  }

  try {
    const document = await resolveResumeDocument(resume);
    const provider = getPDFProvider(query.provider);
    const pdfBuffer = await provider.renderPdf(document, { paperSize: query.paperSize });

    reply.header("Content-Type", "application/pdf");
    reply.header("Content-Disposition", `inline; filename="resume-${id}.pdf"`);
    return reply.send(pdfBuffer);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    server.log.error(message);
    return reply.status(500).send({ error: message });
  }
});

/**
 * Stream compiled PDF of the latest resume version for a target job.
 */
server.get("/api/jobs/:id/resume/latest/pdf", async (request, reply) => {
  const { id } = request.params as { id: string };
  const query = request.query as { paperSize?: "letter" | "a4"; provider?: "typst" | "react-pdf" | "latex" };
  const resume = await resumeRepo.getLatestVersion(id);
  if (!resume) {
    return reply.status(404).send({ error: "No tailored resume found for this job" });
  }

  try {
    const document = await resolveResumeDocument(resume);
    const provider = getPDFProvider(query.provider);
    const pdfBuffer = await provider.renderPdf(document, { paperSize: query.paperSize });

    reply.header("Content-Type", "application/pdf");
    reply.header("Content-Disposition", `inline; filename="resume-${resume.id}.pdf"`);
    return reply.send(pdfBuffer);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    server.log.error(message);
    return reply.status(500).send({ error: message });
  }
});

/**
 * Get rendered source markup from the active or requested provider.
 */
server.get("/api/resumes/:id/source", async (request, reply) => {
  const { id } = request.params as { id: string };
  const query = request.query as { provider?: "typst" | "react-pdf" | "latex" };
  const resume = await resumeRepo.findById(id);
  if (!resume) {
    return reply.status(404).send({ error: "Resume version not found" });
  }

  try {
    const document = await resolveResumeDocument(resume);
    const provider = getPDFProvider(query.provider);
    const source = provider.renderSource ? provider.renderSource(document) : resume.latexSource;
    return {
      provider: provider.name,
      source,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return reply.status(500).send({ error: message });
  }
});

/**
 * Save manual edits to the structured ResumeDocument of a resume version.
 */
server.put("/api/resumes/:id/document", async (request, reply) => {
  const { id } = request.params as { id: string };
  const body = request.body as { document: ResumeDocument };
  if (!body.document) {
    return reply.status(400).send({ error: "Missing required field: document" });
  }

  const parsed = ResumeDocumentSchema.safeParse(body.document);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid ResumeDocument schema", details: parsed.error.issues });
  }

  try {
    const version = await tailoringService.updateResumeDocument(id, parsed.data);
    return { version };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return reply.status(500).send({ error: message });
  }
});

/**
 * @deprecated Legacy endpoint to save manual edits to LaTeX source. Use PUT /api/resumes/:id/document instead.
 */
server.put("/api/resumes/:id/latex", async (request, reply) => {
  const { id } = request.params as { id: string };
  const body = request.body as { latex: string };
  if (!body.latex) {
    return reply.status(400).send({ error: "Missing required field: latex" });
  }

  try {
    const version = await tailoringService.updateCustomLatex(id, body.latex);
    return { version };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return reply.status(500).send({ error: message });
  }
});

/**
 * Launch automated browser application.
 */
server.post("/api/jobs/:id/apply", async (request, reply) => {
  const { id } = request.params as { id: string };
  const body = (request.body as { headless?: boolean }) || {};

  try {
    const run = await agentRunner.startApplication(id, body.headless);
    return { run };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return reply.status(500).send({ error: message });
  }
});

/**
 * Resume a paused agent execution run after human intervention.
 */
server.post("/api/agent-runs/:id/resume", async (request, reply) => {
  const { id } = request.params as { id: string };
  const body = (request.body as { userInput?: string }) || {};

  try {
    const run = await agentRunner.resumeRun(id, body.userInput);
    return { run };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return reply.status(500).send({ error: message });
  }
});

/**
 * Server-Sent Events (SSE) streaming endpoint for live agent execution updates.
 */
server.get("/api/agent-runs/:id/stream", async (request, reply) => {
  const { id } = request.params as { id: string };

  reply.raw.setHeader("Content-Type", "text/event-stream");
  reply.raw.setHeader("Cache-Control", "no-cache");
  reply.raw.setHeader("Connection", "keep-alive");
  reply.raw.setHeader("Access-Control-Allow-Origin", "*");

  const interval = setInterval(async () => {
    const run = await runRepo.findById(id);
    if (!run) {
      clearInterval(interval);
      reply.raw.end();
      return;
    }

    reply.raw.write(`data: ${JSON.stringify(run)}\n\n`);

    if (run.status === "succeeded" || run.status === "failed" || run.status === "waiting_user") {
      clearInterval(interval);
      reply.raw.end();
    }
  }, 1000);

  request.raw.on("close", () => {
    clearInterval(interval);
  });
});

const start = async () => {
  try {
    await server.listen({ port: appConfig.serverPort, host: "0.0.0.0" });
    console.log(`API Server running at ${appConfig.apiUrl}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
