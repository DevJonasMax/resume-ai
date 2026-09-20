import cors from "@fastify/cors";
import { ApplicationLifecycleManager } from "@resume-ai/applications";
import { ApplicationAgentRunner } from "@resume-ai/browser";
import { appConfig } from "@resume-ai/config";
import {
  AgentRunRepository,
  ApplicationRepository,
  CandidateRepository,
  JobRepository,
  ResumeRepository,
  seedDatabase,
} from "@resume-ai/database";
import { JobAnalysisService } from "@resume-ai/jobs";
import { ResumeTailoringService } from "@resume-ai/resume";
import type { Job, JobStatus } from "@resume-ai/types";
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
 * Candidate profile endpoint.
 */
server.get("/api/candidate", async () => {
  const candidate = await candidateRepo.getActiveProfile();
  return { candidate };
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
