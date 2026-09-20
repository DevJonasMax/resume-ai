import type { Application, JobStatus } from "@resume-ai/types";
import { eq } from "drizzle-orm";
import { type AppDatabase, getDb } from "../db.js";
import { applicationsTable } from "../schema.js";

/**
 * Repository tracking application lifecycle and verification states.
 */
export class ApplicationRepository {
  private readonly db: AppDatabase;

  constructor(db?: AppDatabase) {
    this.db = db || getDb();
  }

  public async findByJobId(jobId: string): Promise<Application | null> {
    const record = this.db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.jobId, jobId))
      .get();

    if (!record) return null;

    return {
      id: record.id,
      jobId: record.jobId,
      status: record.status as JobStatus,
      submissionVerified: Boolean(record.submissionVerified),
      submissionProof: record.submissionProof || undefined,
      appliedAt: record.appliedAt || undefined,
      runsCount: record.runsCount,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  public async save(app: Application): Promise<Application> {
    const existing = await this.findByJobId(app.jobId);
    if (existing) {
      this.db
        .update(applicationsTable)
        .set({
          status: app.status,
          submissionVerified: app.submissionVerified ? 1 : 0,
          submissionProof: app.submissionProof || null,
          appliedAt: app.appliedAt || null,
          runsCount: app.runsCount,
          updatedAt: app.updatedAt,
        })
        .where(eq(applicationsTable.id, app.id))
        .run();
    } else {
      this.db
        .insert(applicationsTable)
        .values({
          id: app.id,
          jobId: app.jobId,
          status: app.status,
          submissionVerified: app.submissionVerified ? 1 : 0,
          submissionProof: app.submissionProof || null,
          appliedAt: app.appliedAt || null,
          runsCount: app.runsCount,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
        })
        .run();
    }
    return app;
  }
}
