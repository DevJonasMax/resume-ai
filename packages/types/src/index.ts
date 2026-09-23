import { z } from "zod";
import { ResumeDocumentSchema } from "./resumeDocument.js";

export * from "./resumeDocument.js";

/**
 * Supported non-deprecated Google Gemini models.
 */
export const NON_DEPRECATED_GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
] as const;

export type GeminiModelName = (typeof NON_DEPRECATED_GEMINI_MODELS)[number];

/**
 * Job opportunity status enum representing the full Kanban application pipeline.
 */
export const JobStatusSchema = z.enum([
  "discovered",
  "analyzed",
  "resume_ready",
  "ready_to_apply",
  "applying",
  "applied",
  "interview",
  "archived",
]);

export type JobStatus = z.infer<typeof JobStatusSchema>;

/**
 * Skill classification schema distinguishing core and preferred competencies.
 */
export const SkillItemSchema = z.object({
  name: z.string(),
  category: z.enum(["language", "framework", "tool", "methodology", "soft_skill", "other"]),
  required: z.boolean(),
  criticalityScore: z.number().min(1).max(5),
  evidenceFound: z.string().optional(),
});

export type SkillItem = z.infer<typeof SkillItemSchema>;

/**
 * Gap analysis comparison between candidate profile and job requirements.
 */
export const GapAnalysisSchema = z.object({
  matchPercentage: z.number().min(0).max(100),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  strengths: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type GapAnalysis = z.infer<typeof GapAnalysisSchema>;

/**
 * Structured requirements extracted and evaluated from a job posting.
 */
export const JobRequirementsSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  seniorityLevel: z.string(),
  workModel: z.enum(["remote", "hybrid", "on_site", "unspecified"]),
  locationRequirements: z.string().optional(),
  educationRequirement: z.string().optional(),
  experienceYearsRequired: z.number().optional(),
  skills: z.array(SkillItemSchema),
  responsibilities: z.array(z.string()),
  keywords: z.array(z.string()),
  gapAnalysis: GapAnalysisSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type JobRequirements = z.infer<typeof JobRequirementsSchema>;

/**
 * Core Job Opportunity entity.
 */
export const JobSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  company: z.string().min(1),
  url: z.string().url().or(z.string().length(0)).optional(),
  location: z.string().optional(),
  source: z.string().default("manual"),
  description: z.string(),
  status: JobStatusSchema.default("discovered"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Job = z.infer<typeof JobSchema>;

/**
 * Candidate experience item in verified profile.
 */
export const ExperienceItemSchema = z.object({
  company: z.string(),
  location: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  bulletPoints: z.array(z.string()),
});

export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;

/**
 * Candidate education item in verified profile.
 */
export const EducationItemSchema = z.object({
  institution: z.string(),
  location: z.string(),
  degree: z.string(),
  percentageOrGpa: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type EducationItem = z.infer<typeof EducationItemSchema>;

/**
 * Candidate Profile representing grounded truth of user experience.
 */
export const CandidateProfileSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  location: z.string(),
  summary: z.string(),
  experiences: z.array(ExperienceItemSchema),
  skills: z.record(z.array(z.string())),
  education: z.array(EducationItemSchema),
  isActive: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;

/**
 * Resume version diff tracking structural and textual updates against base profile.
 */
export const ResumeDiffItemSchema = z.object({
  section: z.string(),
  originalText: z.string(),
  tailoredText: z.string(),
  rationalization: z.string(),
  targetedRequirement: z.string().optional(),
});

export type ResumeDiffItem = z.infer<typeof ResumeDiffItemSchema>;

/**
 * Persisted tailored resume version.
 */
export const ResumeVersionSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  versionNumber: z.number().int().positive(),
  latexSource: z.string().optional().default(""),
  resumeData: ResumeDocumentSchema.optional(),
  diffItems: z.array(ResumeDiffItemSchema),
  tailoredSummary: z.string(),
  tailoredExperience: z.array(ExperienceItemSchema),
  createdAt: z.string(),
});

export type ResumeVersion = z.infer<typeof ResumeVersionSchema>;

/**
 * Human intervention prompt when browser automation encounters ambiguity or CAPTCHA.
 */
export const HumanInterventionPromptSchema = z.object({
  required: z.boolean(),
  reason: z.enum(["captcha", "mfa_challenge", "ambiguous_field", "confirmation_required", "error_recovery"]),
  description: z.string(),
  fieldName: z.string().optional(),
  screenshotUrl: z.string().optional(),
  options: z.array(z.string()).optional(),
});

export type HumanInterventionPrompt = z.infer<typeof HumanInterventionPromptSchema>;

/**
 * Browser action space representing atomic navigation steps.
 */
export const BrowserActionTypeSchema = z.enum([
  "CLICK",
  "TYPE_TEXT",
  "SELECT",
  "SCROLL_DOWN",
  "SCROLL_UP",
  "UPLOAD_RESUME",
  "WAIT",
  "DONE",
  "BLOCKED",
]);

export type BrowserActionType = z.infer<typeof BrowserActionTypeSchema>;

/**
 * Element table representation extracted from browser accessibility tree.
 */
export const ElementTableEntrySchema = z.object({
  index: z.number().int(),
  ref: z.string(),
  role: z.string(),
  name: z.string(),
  value: z.string().optional(),
  type: z.string().optional(),
  selector: z.string().optional(),
});

export type ElementTableEntry = z.infer<typeof ElementTableEntrySchema>;

/**
 * Browser action instruction emitted by Jev decision engine.
 */
export const BrowserActionSchema = z.object({
  type: BrowserActionTypeSchema,
  targetRef: z.string().optional(),
  targetIndex: z.number().int().optional(),
  textValue: z.string().optional(),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
});

export type BrowserAction = z.infer<typeof BrowserActionSchema>;

/**
 * Agent run execution lifecycle.
 */
export const AgentRunStatusSchema = z.enum([
  "queued",
  "running",
  "waiting_user",
  "succeeded",
  "failed",
  "cancelled",
]);

export type AgentRunStatus = z.infer<typeof AgentRunStatusSchema>;

/**
 * Recorded agent action event in execution log.
 */
export const AgentRunEventSchema = z.object({
  id: z.string(),
  runId: z.string(),
  stepIndex: z.number().int(),
  timestamp: z.string(),
  actionType: BrowserActionTypeSchema,
  targetElement: z.string().optional(),
  status: z.enum(["started", "completed", "failed", "paused"]),
  details: z.string(),
  screenshotUrl: z.string().optional(),
});

export type AgentRunEvent = z.infer<typeof AgentRunEventSchema>;

/**
 * Agent execution run tracking state.
 */
export const AgentRunSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  status: AgentRunStatusSchema,
  startedAt: z.string(),
  endedAt: z.string().optional(),
  events: z.array(AgentRunEventSchema),
  intervention: HumanInterventionPromptSchema.optional(),
  submissionProof: z.string().optional(),
  errorMessage: z.string().optional(),
});

export type AgentRun = z.infer<typeof AgentRunSchema>;

/**
 * Application record tracking candidate application status.
 */
export const ApplicationSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  status: JobStatusSchema,
  submissionVerified: z.boolean().default(false),
  submissionProof: z.string().optional(),
  appliedAt: z.string().optional(),
  runsCount: z.number().int().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Application = z.infer<typeof ApplicationSchema>;

/**
 * Supported Job Platform identification.
 */
export const JobPlatformIdSchema = z.enum([
  "linkedin",
  "gupy",
  "nerdin",
  "programathor",
  "micro1",
  "glassdoor",
  "geekhunter",
  "revelo",
  "catho",
  "indeed",
  "generic",
]);

export type JobPlatformId = z.infer<typeof JobPlatformIdSchema>;

export const JobPlatformInfoSchema = z.object({
  id: JobPlatformIdSchema,
  name: z.string(),
  domain: z.string(),
  iconKey: z.string(),
  badgeColor: z.string(),
  sampleUrlPattern: z.string(),
});

export type JobPlatformInfo = z.infer<typeof JobPlatformInfoSchema>;

export const ExtractedJobDataSchema = z.object({
  url: z.string(),
  platform: JobPlatformInfoSchema,
  title: z.string(),
  company: z.string(),
  location: z.string(),
  description: z.string(),
  rawHtmlSnippet: z.string().optional(),
});

export type ExtractedJobData = z.infer<typeof ExtractedJobDataSchema>;
