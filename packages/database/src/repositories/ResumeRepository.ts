import type { ResumeDocument, ResumeVersion } from "@resume-ai/types";
import { desc, eq } from "drizzle-orm";
import { type AppDatabase, getDb } from "../db.js";
import { resumeVersionsTable } from "../schema.js";

/**
 * Repository managing tailored resume versions and LaTeX/agnostic document source code.
 */
export class ResumeRepository {
  private readonly db: AppDatabase;

  constructor(db?: AppDatabase) {
    this.db = db || getDb();
  }

  public async findByJobId(jobId: string): Promise<ResumeVersion[]> {
    const records = this.db
      .select()
      .from(resumeVersionsTable)
      .where(eq(resumeVersionsTable.jobId, jobId))
      .orderBy(desc(resumeVersionsTable.versionNumber))
      .all();

    return records.map((r) => ({
      id: r.id,
      jobId: r.jobId,
      versionNumber: r.versionNumber,
      latexSource: r.latexSource,
      resumeData: r.resumeDataJson ? (JSON.parse(r.resumeDataJson) as ResumeDocument) : undefined,
      diffItems: JSON.parse(r.diffItemsJson),
      tailoredSummary: r.tailoredSummary,
      tailoredExperience: JSON.parse(r.tailoredExperienceJson),
      createdAt: r.createdAt,
    }));
  }

  public async getLatestVersion(jobId: string): Promise<ResumeVersion | null> {
    const record = this.db
      .select()
      .from(resumeVersionsTable)
      .where(eq(resumeVersionsTable.jobId, jobId))
      .orderBy(desc(resumeVersionsTable.versionNumber))
      .limit(1)
      .get();

    if (!record) return null;

    return {
      id: record.id,
      jobId: record.jobId,
      versionNumber: record.versionNumber,
      latexSource: record.latexSource,
      resumeData: record.resumeDataJson ? (JSON.parse(record.resumeDataJson) as ResumeDocument) : undefined,
      diffItems: JSON.parse(record.diffItemsJson),
      tailoredSummary: record.tailoredSummary,
      tailoredExperience: JSON.parse(record.tailoredExperienceJson),
      createdAt: record.createdAt,
    };
  }

  public async findById(id: string): Promise<ResumeVersion | null> {
    const record = this.db
      .select()
      .from(resumeVersionsTable)
      .where(eq(resumeVersionsTable.id, id))
      .limit(1)
      .get();

    if (!record) return null;

    return {
      id: record.id,
      jobId: record.jobId,
      versionNumber: record.versionNumber,
      latexSource: record.latexSource,
      resumeData: record.resumeDataJson ? (JSON.parse(record.resumeDataJson) as ResumeDocument) : undefined,
      diffItems: JSON.parse(record.diffItemsJson),
      tailoredSummary: record.tailoredSummary,
      tailoredExperience: JSON.parse(record.tailoredExperienceJson),
      createdAt: record.createdAt,
    };
  }

  public async updateLatexSource(id: string, latexSource: string): Promise<ResumeVersion | null> {
    this.db
      .update(resumeVersionsTable)
      .set({ latexSource })
      .where(eq(resumeVersionsTable.id, id))
      .run();

    return this.findById(id);
  }

  public async updateResumeData(id: string, resumeData: ResumeDocument): Promise<ResumeVersion | null> {
    this.db
      .update(resumeVersionsTable)
      .set({ resumeDataJson: JSON.stringify(resumeData) })
      .where(eq(resumeVersionsTable.id, id))
      .run();

    return this.findById(id);
  }

  public async saveVersion(version: ResumeVersion): Promise<ResumeVersion> {
    this.db
      .insert(resumeVersionsTable)
      .values({
        id: version.id,
        jobId: version.jobId,
        versionNumber: version.versionNumber,
        latexSource: version.latexSource ?? "",
        resumeDataJson: version.resumeData ? JSON.stringify(version.resumeData) : null,
        diffItemsJson: JSON.stringify(version.diffItems),
        tailoredSummary: version.tailoredSummary,
        tailoredExperienceJson: JSON.stringify(version.tailoredExperience),
        createdAt: version.createdAt,
      })
      .run();

    return version;
  }
}
