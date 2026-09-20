import { type AIProvider, getAIProvider } from "@resume-ai/ai";
import { CandidateRepository, JobRepository, ResumeRepository } from "@resume-ai/database";
import type { ResumeDiffItem, ResumeVersion } from "@resume-ai/types";
import { z } from "zod";
import { LaTeXEngine } from "./LaTeXEngine.js";

const TailoringOutputSchema = z.object({
  tailoredSummary: z.string(),
  tailoredExperience: z.array(
    z.object({
      company: z.string(),
      location: z.string(),
      role: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      bulletPoints: z.array(z.string()),
    })
  ),
  diffItems: z.array(
    z.object({
      section: z.string(),
      originalText: z.string(),
      tailoredText: z.string(),
      rationalization: z.string(),
      targetedRequirement: z.string().optional(),
    })
  ),
});

/**
 * Service managing grounded resume tailoring and LaTeX document versioning.
 */
export class ResumeTailoringService {
  private readonly jobRepo: JobRepository;
  private readonly candidateRepo: CandidateRepository;
  private readonly resumeRepo: ResumeRepository;
  private readonly ai: AIProvider;
  private readonly latexEngine: LaTeXEngine;

  constructor(
    jobRepo?: JobRepository,
    candidateRepo?: CandidateRepository,
    resumeRepo?: ResumeRepository,
    ai?: AIProvider,
    latexEngine?: LaTeXEngine
  ) {
    this.jobRepo = jobRepo || new JobRepository();
    this.candidateRepo = candidateRepo || new CandidateRepository();
    this.resumeRepo = resumeRepo || new ResumeRepository();
    this.ai = ai || getAIProvider();
    this.latexEngine = latexEngine || new LaTeXEngine();
  }

  /**
   * Generates a tailored LaTeX resume version aligned with job requirements while strictly grounded in candidate truth.
   */
  public async generateTailoredResume(jobId: string, candidateId?: string): Promise<ResumeVersion> {
    const job = await this.jobRepo.findById(jobId);
    if (!job) {
      throw new Error(`Job not found with id: ${jobId}`);
    }

    const requirements = await this.jobRepo.getRequirements(jobId);
    if (!requirements) {
      throw new Error(`Job requirements have not been analyzed yet for job: ${jobId}`);
    }

    const candidate = candidateId
      ? await this.candidateRepo.getProfileById(candidateId)
      : await this.candidateRepo.getActiveProfile();

    if (!candidate) {
      throw new Error("No candidate profile found to tailor resume against");
    }

    const existingVersions = await this.resumeRepo.findByJobId(jobId);
    const nextVersionNumber = existingVersions.length + 1;

    const prompt = `You are an executive career advisor and resume specialist.
Tailor the candidate's professional resume to match the target job description while strictly upholding factual truth.

RULES:
1. NEVER invent jobs, degrees, companies, or dates.
2. Highlight accomplishments, methodologies, and technologies relevant to the requirements.
3. Optimize phrasing for ATS matching and readability.

TARGET JOB:
Title: ${job.title}
Company: ${job.company}
Key Skills Needed: ${requirements.skills.map((s) => s.name).join(", ")}
Responsibilities: ${requirements.responsibilities.join("; ")}

CANDIDATE PROFILE:
Summary: ${candidate.summary}
Experiences: ${JSON.stringify(candidate.experiences, null, 2)}

Provide tailoredSummary, tailoredExperience, and a detailed list of diffItems explaining the improvements made.`;

    const tailored = await this.ai.generateStructured({
      schema: TailoringOutputSchema,
      prompt,
      systemPrompt:
        "You are an expert resume tailoring assistant. Optimize impact, vocabulary, and relevance without hallucinating unverified candidate history.",
    });

    const latexSource = this.latexEngine.renderDocument({
      candidate,
      summary: tailored.tailoredSummary,
      experiences: tailored.tailoredExperience,
    });

    const now = new Date().toISOString();
    const version: ResumeVersion = {
      id: `res-${jobId}-v${nextVersionNumber}`,
      jobId,
      versionNumber: nextVersionNumber,
      latexSource,
      diffItems: tailored.diffItems as ResumeDiffItem[],
      tailoredSummary: tailored.tailoredSummary,
      tailoredExperience: tailored.tailoredExperience,
      createdAt: now,
    };

    await this.resumeRepo.saveVersion(version);
    await this.jobRepo.updateStatus(jobId, "resume_ready");

    return version;
  }

  /**
   * Refines an existing resume version with the AI Agent according to specific user instructions or deeper ATS optimization.
   */
  public async refineResumeWithAgent(resumeId: string, instructions?: string): Promise<ResumeVersion> {
    const existing = await this.resumeRepo.findById(resumeId);
    if (!existing) {
      throw new Error(`Resume version not found with id: ${resumeId}`);
    }

    const job = await this.jobRepo.findById(existing.jobId);
    if (!job) {
      throw new Error(`Job not found with id: ${existing.jobId}`);
    }

    const requirements = await this.jobRepo.getRequirements(existing.jobId);
    const candidate = await this.candidateRepo.getActiveProfile();
    if (!candidate) {
      throw new Error("No active candidate profile found in database");
    }

    const existingVersions = await this.resumeRepo.findByJobId(existing.jobId);
    const nextVersionNumber = existingVersions.length + 1;

    const userInstructionsText = instructions && instructions.trim().length > 0
      ? `USER DIRECTIVES FOR THIS ITERATION:\n${instructions.trim()}`
      : "Focus on maximizing ATS keyword precision and quantifiable impact metrics.";

    const prompt = `You are an elite AI technical recruiter and resume tailoring agent.
Review the current resume LaTeX source and improve its alignment with the target job requirements.

${userInstructionsText}

TARGET JOB:
Title: ${job.title}
Company: ${job.company}
Key Skills Needed: ${requirements ? requirements.skills.map((s) => s.name).join(", ") : "Standard industry competencies"}
Responsibilities: ${requirements ? requirements.responsibilities.join("; ") : "Execute high-quality technical deliverables"}

EXISTING TAILORED CONTENT:
Summary: ${existing.tailoredSummary}
Experiences: ${JSON.stringify(existing.tailoredExperience, null, 2)}

Provide tailoredSummary, tailoredExperience, and a detailed list of diffItems with clear rationalizations for each improvement.`;

    const tailored = await this.ai.generateStructured({
      schema: TailoringOutputSchema,
      prompt,
      systemPrompt:
        "You are an AI resume refinement agent. Elevate terminology, emphasize required tools, and produce clear rationales without altering underlying facts.",
    });

    const latexSource = this.latexEngine.renderDocument({
      candidate,
      summary: tailored.tailoredSummary,
      experiences: tailored.tailoredExperience,
    });

    const now = new Date().toISOString();
    const refinedVersion: ResumeVersion = {
      id: `res-${existing.jobId}-v${nextVersionNumber}`,
      jobId: existing.jobId,
      versionNumber: nextVersionNumber,
      latexSource,
      diffItems: tailored.diffItems as ResumeDiffItem[],
      tailoredSummary: tailored.tailoredSummary,
      tailoredExperience: tailored.tailoredExperience,
      createdAt: now,
    };

    await this.resumeRepo.saveVersion(refinedVersion);
    return refinedVersion;
  }

  /**
   * Updates the raw LaTeX source of a resume version following manual user edits in the Resume Studio.
   */
  public async updateCustomLatex(resumeId: string, customLatex: string): Promise<ResumeVersion> {
    const updated = await this.resumeRepo.updateLatexSource(resumeId, customLatex);
    if (!updated) {
      throw new Error(`Resume version not found with id: ${resumeId}`);
    }
    return updated;
  }
}
