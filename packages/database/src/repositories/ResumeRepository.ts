import type { ResumeVersion } from "@resume-ai/types";
import { desc, eq } from "drizzle-orm";
import { type AppDatabase, getDb } from "../db.js";
import { resumeVersionsTable } from "../schema.js";

/**
 * Repository managing tailored resume versions and LaTeX source code.
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
      diffItems: JSON.parse(record.diffItemsJson),
      tailoredSummary: record.tailoredSummary,
      tailoredExperience: JSON.parse(record.tailoredExperienceJson),
      createdAt: record.createdAt,
    };
  }

  public async saveVersion(version: ResumeVersion): Promise<ResumeVersion> {
    this.db
      .insert(resumeVersionsTable)
      .values({
        id: version.id,
        jobId: version.jobId,
        versionNumber: version.versionNumber,
        latexSource: version.latexSource,
        diffItemsJson: JSON.stringify(version.diffItems),
        tailoredSummary: version.tailoredSummary,
        tailoredExperienceJson: JSON.stringify(version.tailoredExperience),
        createdAt: version.createdAt,
      })
      .run();

    return version;
  }
}
