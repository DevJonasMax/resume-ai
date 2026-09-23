import { type AIProvider, getAIProvider } from "@resume-ai/ai";
import { CandidateRepository, JobRepository } from "@resume-ai/database";
import { RequirementScorer } from "@resume-ai/jev";
import type { CandidateProfile, GapAnalysis, JobRequirements } from "@resume-ai/types";
import { z } from "zod";

const ExtractionSchema = z.object({
  seniorityLevel: z.string(),
  workModel: z.enum(["remote", "hybrid", "on_site", "unspecified"]),
  locationRequirements: z.string().optional(),
  educationRequirement: z.string().optional(),
  experienceYearsRequired: z.number().optional(),
  skills: z.array(
    z.object({
      name: z.string(),
      category: z.enum(["language", "framework", "tool", "methodology", "soft_skill", "other"]),
      required: z.boolean(),
      criticalityScore: z.number().default(3),
      evidenceFound: z.string().optional(),
    })
  ),
  responsibilities: z.array(z.string()),
  keywords: z.array(z.string()),
});

/**
 * Service orchestrating AI job parsing, Jev criticality scoring, and candidate gap analysis.
 */
export class JobAnalysisService {
  private readonly jobRepo: JobRepository;
  private readonly candidateRepo: CandidateRepository;
  private readonly ai: AIProvider;
  private readonly jevScorer: RequirementScorer;

  constructor(
    jobRepo?: JobRepository,
    candidateRepo?: CandidateRepository,
    ai?: AIProvider,
    jevScorer?: RequirementScorer
  ) {
    this.jobRepo = jobRepo || new JobRepository();
    this.candidateRepo = candidateRepo || new CandidateRepository();
    this.ai = ai || getAIProvider();
    this.jevScorer = jevScorer || new RequirementScorer();
  }

  /**
   * Analyzes an existing job posting by extracting structured requirements and performing gap analysis.
   */
  public async analyzeJob(jobId: string): Promise<JobRequirements> {
    const job = await this.jobRepo.findById(jobId);
    if (!job) {
      throw new Error(`Job not found with id: ${jobId}`);
    }

    const candidate = await this.candidateRepo.getActiveProfile();
    if (!candidate) {
      throw new Error("No active candidate profile found in database");
    }

    const prompt = `Analyze this job posting and extract structured requirements, core skills, responsibilities, and keywords:
Job Title: ${job.title}
Company: ${job.company}
Description:
${job.description}

Extract:
1. Seniority Level (Junior, Mid, Senior, Lead, Staff, Principal)
2. Work Model (remote, hybrid, on_site, unspecified)
3. Location requirements
4. Education requirement
5. Years of experience required
6. Required vs preferred skills with category and quotation/evidence
7. Primary responsibilities
8. ATS keywords`;

    const rawExtraction = await this.ai.generateStructured({
      schema: ExtractionSchema,
      prompt,
      systemPrompt:
        "You are an expert technical recruiter and ATS parser. Extract verified structured requirements from job descriptions accurately without hallucinating unmentioned qualifications.",
    });

    // Calibrate requirement criticality scores via Jev
    const calibratedSkills = await this.jevScorer.calibrateSkills(
      rawExtraction.skills.map((s) => ({
        ...s,
        criticalityScore: s.criticalityScore ?? 3,
      })),
      job.description
    );

    // Compute candidate gap analysis
    const gapAnalysis = this.computeGapAnalysis(calibratedSkills, candidate);

    const now = new Date().toISOString();
    const requirements: JobRequirements = {
      id: `req-${jobId}`,
      jobId,
      seniorityLevel: rawExtraction.seniorityLevel,
      workModel: rawExtraction.workModel,
      locationRequirements: rawExtraction.locationRequirements,
      educationRequirement: rawExtraction.educationRequirement,
      experienceYearsRequired: rawExtraction.experienceYearsRequired,
      skills: calibratedSkills,
      responsibilities: rawExtraction.responsibilities,
      keywords: rawExtraction.keywords,
      gapAnalysis,
      createdAt: now,
      updatedAt: now,
    };

    await this.jobRepo.saveRequirements(requirements);
    await this.jobRepo.updateStatus(jobId, "analyzed");

    return requirements;
  }

  /**
   * Evaluates candidate competence against extracted skills to compute match percentages and gap recommendations.
   */
  private computeGapAnalysis(skills: JobRequirements["skills"], candidate: CandidateProfile): GapAnalysis {
    const candidateSkillsList = candidate.skills ? Object.values(candidate.skills).flat() : [];
    const candidateTextCorpus = [
      candidate.summary || "",
      ...(candidate.experiences || []).flatMap((e) => e.bulletPoints || []),
      ...candidateSkillsList,
    ]
      .join(" ")
      .toLowerCase();

    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const skill of skills) {
      const lowerName = skill.name.trim().toLowerCase();
      if (!lowerName) continue;

      const isDirectMatch = candidateSkillsList.some((s) => {
        const sLower = s.trim().toLowerCase();
        return sLower === lowerName || sLower.includes(lowerName) || (lowerName.length > 3 && lowerName.includes(sLower));
      });

      const escaped = lowerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const isCorpusMatch = new RegExp(`\\b${escaped}\\b`, "i").test(candidateTextCorpus);

      if (isDirectMatch || isCorpusMatch) {
        matchingSkills.push(skill.name);
      } else {
        missingSkills.push(skill.name);
      }
    }

    const totalSkills = skills.length;
    const matchPercentage =
      totalSkills > 0 ? Math.round((matchingSkills.length / totalSkills) * 100) : 100;

    const strengths: string[] = [
      `Solid foundation matching ${matchingSkills.length} of ${totalSkills} identified skills.`,
    ];

    if (matchingSkills.length > 0) {
      strengths.push(`Verified real-world experience in ${matchingSkills.slice(0, 3).join(", ")}.`);
    } else {
      strengths.push("Candidate profile requires targeted skill alignment or transferable project evidence.");
    }

    const recommendations: string[] = [];
    if (missingSkills.length > 0) {
      recommendations.push(
        `Highlight transferable competencies or related tooling for ${missingSkills.slice(0, 3).join(", ")}.`
      );
    }
    recommendations.push("Frame achievements with quantifiable metrics in tailored bullet points.");

    return {
      matchPercentage,
      matchingSkills,
      missingSkills,
      strengths,
      recommendations,
    };
  }
}
