import type { AgentRun, AgentRunStatus } from "@resume-ai/types";
import { desc, eq } from "drizzle-orm";
import { type AppDatabase, getDb } from "../db.js";
import { agentRunsTable } from "../schema.js";

/**
 * Repository persisting agent execution runs, telemetry events, and intervention states.
 */
export class AgentRunRepository {
  private readonly db: AppDatabase;

  constructor(db?: AppDatabase) {
    this.db = db || getDb();
  }

  public async findById(id: string): Promise<AgentRun | null> {
    const record = this.db.select().from(agentRunsTable).where(eq(agentRunsTable.id, id)).get();
    if (!record) return null;

    return {
      id: record.id,
      jobId: record.jobId,
      status: record.status as AgentRunStatus,
      startedAt: record.startedAt,
      endedAt: record.endedAt || undefined,
      events: JSON.parse(record.eventsJson),
      intervention: record.interventionJson ? JSON.parse(record.interventionJson) : undefined,
      submissionProof: record.submissionProof || undefined,
      errorMessage: record.errorMessage || undefined,
    };
  }

  public async findByJobId(jobId: string): Promise<AgentRun[]> {
    const records = this.db
      .select()
      .from(agentRunsTable)
      .where(eq(agentRunsTable.jobId, jobId))
      .orderBy(desc(agentRunsTable.startedAt))
      .all();

    return records.map((record) => ({
      id: record.id,
      jobId: record.jobId,
      status: record.status as AgentRunStatus,
      startedAt: record.startedAt,
      endedAt: record.endedAt || undefined,
      events: JSON.parse(record.eventsJson),
      intervention: record.interventionJson ? JSON.parse(record.interventionJson) : undefined,
      submissionProof: record.submissionProof || undefined,
      errorMessage: record.errorMessage || undefined,
    }));
  }

  public async save(run: AgentRun): Promise<AgentRun> {
    const existing = await this.findById(run.id);
    if (existing) {
      this.db
        .update(agentRunsTable)
        .set({
          status: run.status,
          endedAt: run.endedAt || null,
          eventsJson: JSON.stringify(run.events),
          interventionJson: run.intervention ? JSON.stringify(run.intervention) : null,
          submissionProof: run.submissionProof || null,
          errorMessage: run.errorMessage || null,
        })
        .where(eq(agentRunsTable.id, run.id))
        .run();
    } else {
      this.db
        .insert(agentRunsTable)
        .values({
          id: run.id,
          jobId: run.jobId,
          status: run.status,
          startedAt: run.startedAt,
          endedAt: run.endedAt || null,
          eventsJson: JSON.stringify(run.events),
          interventionJson: run.intervention ? JSON.stringify(run.intervention) : null,
          submissionProof: run.submissionProof || null,
          errorMessage: run.errorMessage || null,
        })
        .run();
    }
    return run;
  }
}
