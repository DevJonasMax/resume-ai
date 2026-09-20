import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Candidate profiles storing verified factual career history.
 */
export const candidateProfilesTable = sqliteTable("candidate_profiles", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  location: text("location").notNull(),
  summary: text("summary").notNull(),
  experiencesJson: text("experiences_json").notNull(),
  skillsJson: text("skills_json").notNull(),
  educationJson: text("education_json").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

/**
 * Jobs table recording opportunities and application pipeline status.
 */
export const jobsTable = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  url: text("url"),
  location: text("location"),
  source: text("source").notNull().default("manual"),
  description: text("description").notNull(),
  status: text("status").notNull().default("discovered"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

/**
 * Structured requirements extracted from job postings.
 */
export const jobRequirementsTable = sqliteTable("job_requirements", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobsTable.id, { onDelete: "cascade" }),
  seniorityLevel: text("seniority_level").notNull(),
  workModel: text("work_model").notNull().default("unspecified"),
  locationRequirements: text("location_requirements"),
  educationRequirement: text("education_requirement"),
  experienceYearsRequired: integer("experience_years_required"),
  skillsJson: text("skills_json").notNull(),
  responsibilitiesJson: text("responsibilities_json").notNull(),
  keywordsJson: text("keywords_json").notNull(),
  gapAnalysisJson: text("gap_analysis_json"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

/**
 * Tailored resume versions generated in LaTeX.
 */
export const resumeVersionsTable = sqliteTable("resume_versions", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobsTable.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  latexSource: text("latex_source").notNull(),
  diffItemsJson: text("diff_items_json").notNull(),
  tailoredSummary: text("tailored_summary").notNull(),
  tailoredExperienceJson: text("tailored_experience_json").notNull(),
  createdAt: text("created_at").notNull(),
});

/**
 * Applications tracking application history and submission verification.
 */
export const applicationsTable = sqliteTable("applications", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobsTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("discovered"),
  submissionVerified: integer("submission_verified").notNull().default(0),
  submissionProof: text("submission_proof"),
  appliedAt: text("applied_at"),
  runsCount: integer("runs_count").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

/**
 * Agent run telemetry and action logs.
 */
export const agentRunsTable = sqliteTable("agent_runs", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobsTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("queued"),
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at"),
  eventsJson: text("events_json").notNull().default("[]"),
  interventionJson: text("intervention_json"),
  submissionProof: text("submission_proof"),
  errorMessage: text("error_message"),
});
