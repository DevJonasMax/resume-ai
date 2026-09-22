import { z } from "zod";

/**
 * Agnostic candidate basic contact and profile information for resumes.
 */
export const ResumeBasicsSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  title: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
});

export type ResumeBasics = z.infer<typeof ResumeBasicsSchema>;

/**
 * Agnostic work experience entry in a structured resume.
 */
export const ResumeExperienceItemSchema = z.object({
  company: z.string(),
  location: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  bulletPoints: z.array(z.string()),
});

export type ResumeExperienceItem = z.infer<typeof ResumeExperienceItemSchema>;

/**
 * Agnostic educational credential item in a structured resume.
 */
export const ResumeEducationItemSchema = z.object({
  institution: z.string(),
  location: z.string(),
  degree: z.string(),
  percentageOrGpa: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type ResumeEducationItem = z.infer<typeof ResumeEducationItemSchema>;

/**
 * Agnostic skill categorization group (e.g. Languages, Frameworks, Developer Tools).
 */
export const ResumeSkillGroupSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

export type ResumeSkillGroup = z.infer<typeof ResumeSkillGroupSchema>;

/**
 * Agnostic technical or academic project item in a structured resume.
 */
export const ResumeProjectItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()).optional(),
  link: z.string().optional(),
  bulletPoints: z.array(z.string()).optional(),
});

export type ResumeProjectItem = z.infer<typeof ResumeProjectItemSchema>;

/**
 * Canonical, renderer-agnostic resume document schema.
 * Decouples resume generation from specific rendering engines (Typst, React-PDF, LaTeX).
 */
export const ResumeDocumentSchema = z.object({
  basics: ResumeBasicsSchema,
  summary: z.string(),
  experiences: z.array(ResumeExperienceItemSchema),
  skills: z.array(ResumeSkillGroupSchema),
  education: z.array(ResumeEducationItemSchema),
  projects: z.array(ResumeProjectItemSchema).optional(),
});

export type ResumeDocument = z.infer<typeof ResumeDocumentSchema>;
