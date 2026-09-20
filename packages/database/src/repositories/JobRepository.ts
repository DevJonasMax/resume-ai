import type { Job, JobRequirements, JobStatus } from "@resume-ai/types";
import { eq } from "drizzle-orm";
import { type AppDatabase, getDb } from "../db.js";
import { jobRequirementsTable, jobsTable } from "../schema.js";

/**
 * Repository handling persistence operations for Jobs and Job Requirements.
 */
export class JobRepository {
  private readonly db: AppDatabase;

  constructor(db?: AppDatabase) {
    this.db = db || getDb();
  }

  public async findAll(): Promise<Job[]> {
    const records = this.db.select().from(jobsTable).all();
    return records.map((r) => ({
      id: r.id,
      title: r.title,
      company: r.company,
      url: r.url || undefined,
      location: r.location || undefined,
      source: r.source,
      description: r.description,
      status: r.status as JobStatus,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  public async findById(id: string): Promise<Job | null> {
    const record = this.db.select().from(jobsTable).where(eq(jobsTable.id, id)).get();
    if (!record) return null;

    return {
      id: record.id,
      title: record.title,
      company: record.company,
      url: record.url || undefined,
      location: record.location || undefined,
      source: record.source,
      description: record.description,
      status: record.status as JobStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  public async save(job: Job): Promise<Job> {
    const existing = await this.findById(job.id);
    if (existing) {
      this.db
        .update(jobsTable)
        .set({
          title: job.title,
          company: job.company,
          url: job.url || null,
          location: job.location || null,
          source: job.source,
          description: job.description,
          status: job.status,
          updatedAt: job.updatedAt,
        })
        .where(eq(jobsTable.id, job.id))
        .run();
    } else {
      this.db
        .insert(jobsTable)
        .values({
          id: job.id,
          title: job.title,
          company: job.company,
          url: job.url || null,
          location: job.location || null,
          source: job.source,
          description: job.description,
          status: job.status,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        })
        .run();
    }
    return job;
  }

  public async updateStatus(id: string, status: JobStatus): Promise<void> {
    this.db
      .update(jobsTable)
      .set({
        status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(jobsTable.id, id))
      .run();
  }

  public async delete(id: string): Promise<void> {
    this.db.delete(jobsTable).where(eq(jobsTable.id, id)).run();
  }

  public async getRequirements(jobId: string): Promise<JobRequirements | null> {
    const record = this.db
      .select()
      .from(jobRequirementsTable)
      .where(eq(jobRequirementsTable.jobId, jobId))
      .get();
    if (!record) return null;

    return {
      id: record.id,
      jobId: record.jobId,
      seniorityLevel: record.seniorityLevel,
      workModel: record.workModel as JobRequirements["workModel"],
      locationRequirements: record.locationRequirements || undefined,
      educationRequirement: record.educationRequirement || undefined,
      experienceYearsRequired: record.experienceYearsRequired || undefined,
      skills: JSON.parse(record.skillsJson),
      responsibilities: JSON.parse(record.responsibilitiesJson),
      keywords: JSON.parse(record.keywordsJson),
      gapAnalysis: record.gapAnalysisJson ? JSON.parse(record.gapAnalysisJson) : undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  public async saveRequirements(reqs: JobRequirements): Promise<JobRequirements> {
    const existing = await this.getRequirements(reqs.jobId);
    if (existing) {
      this.db
        .update(jobRequirementsTable)
        .set({
          seniorityLevel: reqs.seniorityLevel,
          workModel: reqs.workModel,
          locationRequirements: reqs.locationRequirements || null,
          educationRequirement: reqs.educationRequirement || null,
          experienceYearsRequired: reqs.experienceYearsRequired || null,
          skillsJson: JSON.stringify(reqs.skills),
          responsibilitiesJson: JSON.stringify(reqs.responsibilities),
          keywordsJson: JSON.stringify(reqs.keywords),
          gapAnalysisJson: reqs.gapAnalysis ? JSON.stringify(reqs.gapAnalysis) : null,
          updatedAt: reqs.updatedAt,
        })
        .where(eq(jobRequirementsTable.jobId, reqs.jobId))
        .run();
    } else {
      this.db
        .insert(jobRequirementsTable)
        .values({
          id: reqs.id,
          jobId: reqs.jobId,
          seniorityLevel: reqs.seniorityLevel,
          workModel: reqs.workModel,
          locationRequirements: reqs.locationRequirements || null,
          educationRequirement: reqs.educationRequirement || null,
          experienceYearsRequired: reqs.experienceYearsRequired || null,
          skillsJson: JSON.stringify(reqs.skills),
          responsibilitiesJson: JSON.stringify(reqs.responsibilities),
          keywordsJson: JSON.stringify(reqs.keywords),
          gapAnalysisJson: reqs.gapAnalysis ? JSON.stringify(reqs.gapAnalysis) : null,
          createdAt: reqs.createdAt,
          updatedAt: reqs.updatedAt,
        })
        .run();
    }
    return reqs;
  }
}
