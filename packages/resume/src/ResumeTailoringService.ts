import { type AIProvider, getAIProvider } from "@resume-ai/ai";
import { CandidateRepository, JobRepository, ResumeRepository } from "@resume-ai/database";
import type {
  CandidateProfile,
  ResumeDiffItem,
  ResumeDocument,
  ResumeEducationItem,
  ResumeSkillGroup,
  ResumeVersion,
} from "@resume-ai/types";
import { z } from "zod";
import { LaTeXEngine } from "./LaTeXEngine.js";

const TailoringOutputSchema = z.object({
  thoughtProcess: z.string().optional(),
  strategicDecisions: z.array(z.string()).optional(),
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
 * Service managing grounded resume tailoring and multi-provider document versioning.
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
   * Helper assembling canonical ResumeDocument from candidate ground truth and tailored sections.
   */
  private buildResumeDocument(
    candidate: CandidateProfile,
    tailoredSummary: string,
    tailoredExperience: CandidateProfile["experiences"]
  ): ResumeDocument {
    const skills: ResumeSkillGroup[] = Object.entries(candidate.skills).map(([category, items]) => ({
      category,
      items,
    }));

    const education: ResumeEducationItem[] = candidate.education.map((edu) => ({
      institution: edu.institution,
      location: edu.location,
      degree: edu.degree,
      percentageOrGpa: edu.percentageOrGpa,
      startDate: edu.startDate,
      endDate: edu.endDate,
    }));

    return {
      basics: {
        fullName: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location,
      },
      summary: tailoredSummary,
      experiences: tailoredExperience,
      skills,
      education,
    };
  }

  /**
   * Generates a tailored resume version producing a renderer-agnostic ResumeDocument.
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

    const resumeData = this.buildResumeDocument(candidate, tailored.tailoredSummary, tailored.tailoredExperience);

    // Retain legacy LaTeX source generation for backward-compatibility
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
      resumeData,
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
   * Refines an existing resume version with the AI Agent according to specific user instructions.
   */
  public async refineResumeWithAgent(
    resumeId: string,
    instructions?: string,
    model?: string
  ): Promise<{
    version: ResumeVersion;
    thoughtProcess?: string | undefined;
    strategicDecisions?: string[] | undefined;
  }> {
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
Review the current resume and improve its alignment with the target job requirements.

${userInstructionsText}

TARGET JOB:
Title: ${job.title}
Company: ${job.company}
Key Skills Needed: ${requirements ? requirements.skills.map((s) => s.name).join(", ") : "Standard industry competencies"}
Responsibilities: ${requirements ? requirements.responsibilities.join("; ") : "Execute high-quality technical deliverables"}

EXISTING TAILORED CONTENT:
Summary: ${existing.tailoredSummary}
Experiences: ${JSON.stringify(existing.tailoredExperience, null, 2)}

Provide:
1. thoughtProcess: Step-by-step reasoning analyzing candidate background, keyword gap analysis, and ATS positioning trade-offs.
2. strategicDecisions: List of 2-4 key editorial choices made (e.g. metrics added, technologies emphasized).
3. tailoredSummary: Enhanced summary.
4. tailoredExperience: Polished experiences with high-impact bullets.
5. diffItems: Detailed list of diffItems with clear rationalizations for each improvement.`;

    const tailored = await this.ai.generateStructured({
      schema: TailoringOutputSchema,
      prompt,
      systemPrompt:
        "You are an AI resume refinement agent. Elevate terminology, emphasize required tools, and produce clear rationales without altering underlying facts.",
      ...(model ? { model } : {}),
    });

    const resumeData: ResumeDocument = existing.resumeData
      ? {
          ...existing.resumeData,
          summary: tailored.tailoredSummary,
          experiences: tailored.tailoredExperience,
        }
      : this.buildResumeDocument(candidate, tailored.tailoredSummary, tailored.tailoredExperience);

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
      resumeData,
      diffItems: tailored.diffItems as ResumeDiffItem[],
      tailoredSummary: tailored.tailoredSummary,
      tailoredExperience: tailored.tailoredExperience,
      createdAt: now,
    };

    await this.resumeRepo.saveVersion(refinedVersion);
    return {
      version: refinedVersion,
      thoughtProcess: tailored.thoughtProcess,
      strategicDecisions: tailored.strategicDecisions,
    };
  }

  /**
   * Updates the structured ResumeDocument of a resume version following user edits in Resume Studio.
   */
  public async updateResumeDocument(resumeId: string, resumeData: ResumeDocument): Promise<ResumeVersion> {
    const updated = await this.resumeRepo.updateResumeData(resumeId, resumeData);
    if (!updated) {
      throw new Error(`Resume version not found with id: ${resumeId}`);
    }
    return updated;
  }

  /**
   * @deprecated Updates raw LaTeX source for legacy compatibility. Use updateResumeDocument instead.
   */
  public async updateCustomLatex(resumeId: string, customLatex: string): Promise<ResumeVersion> {
    const updated = await this.resumeRepo.updateLatexSource(resumeId, customLatex);
    if (!updated) {
      throw new Error(`Resume version not found with id: ${resumeId}`);
    }
    return updated;
  }
}
