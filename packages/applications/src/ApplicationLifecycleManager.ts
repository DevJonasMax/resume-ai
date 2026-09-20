import { ApplicationRepository, JobRepository } from "@resume-ai/database";
import type { Application, JobStatus } from "@resume-ai/types";

/**
 * Valid allowed state transitions for the job application state machine.
 */
const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  discovered: ["analyzed", "archived"],
  analyzed: ["resume_ready", "archived"],
  resume_ready: ["ready_to_apply", "analyzed", "archived"],
  ready_to_apply: ["applying", "resume_ready", "archived"],
  applying: ["applied", "ready_to_apply", "archived"],
  applied: ["interview", "archived"],
  interview: ["archived"],
  archived: ["discovered", "ready_to_apply"],
};

/**
 * Manages application lifecycle transitions, invariant enforcement, and submission evidence verification.
 */
export class ApplicationLifecycleManager {
  private readonly jobRepo: JobRepository;
  private readonly appRepo: ApplicationRepository;

  constructor(jobRepo?: JobRepository, appRepo?: ApplicationRepository) {
    this.jobRepo = jobRepo || new JobRepository();
    this.appRepo = appRepo || new ApplicationRepository();
  }

  /**
   * Evaluates whether a requested transition is valid under domain invariants.
   */
  public isValidTransition(currentStatus: JobStatus, nextStatus: JobStatus): boolean {
    const allowed = VALID_TRANSITIONS[currentStatus];
    return Boolean(allowed && allowed.includes(nextStatus));
  }

  /**
   * Transitions a job opportunity to the next lifecycle state.
   */
  public async transition(jobId: string, nextStatus: JobStatus): Promise<void> {
    const job = await this.jobRepo.findById(jobId);
    if (!job) {
      throw new Error(`Job not found with id: ${jobId}`);
    }

    if (job.status === nextStatus) {
      return;
    }

    if (!this.isValidTransition(job.status, nextStatus)) {
      throw new Error(`Invalid status transition from "${job.status}" to "${nextStatus}" for job: ${jobId}`);
    }

    // Never allow transitioning to "applied" without cryptographic or verified DOM proof
    if (nextStatus === "applied") {
      throw new Error('Direct transition to "applied" requires submission proof. Use markAsApplied() instead.');
    }

    await this.jobRepo.updateStatus(jobId, nextStatus);

    let app = await this.appRepo.findByJobId(jobId);
    const now = new Date().toISOString();

    if (!app) {
      app = {
        id: `app-${jobId}`,
        jobId,
        status: nextStatus,
        submissionVerified: false,
        runsCount: 0,
        createdAt: now,
        updatedAt: now,
      };
    } else {
      app.status = nextStatus;
      app.updatedAt = now;
    }

    await this.appRepo.save(app);
  }

  /**
   * Marks an application as completed only when verified proof of submission is supplied.
   */
  public async markAsApplied(jobId: string, submissionProof: string): Promise<Application> {
    if (!submissionProof || submissionProof.trim().length === 0) {
      throw new Error("Cannot mark application as applied without submission proof evidence");
    }

    const job = await this.jobRepo.findById(jobId);
    if (!job) {
      throw new Error(`Job not found with id: ${jobId}`);
    }

    const now = new Date().toISOString();
    let app = await this.appRepo.findByJobId(jobId);

    if (!app) {
      app = {
        id: `app-${jobId}`,
        jobId,
        status: "applied",
        submissionVerified: true,
        submissionProof,
        appliedAt: now,
        runsCount: 1,
        createdAt: now,
        updatedAt: now,
      };
    } else {
      app.status = "applied";
      app.submissionVerified = true;
      app.submissionProof = submissionProof;
      app.appliedAt = now;
      app.updatedAt = now;
    }

    await this.appRepo.save(app);
    await this.jobRepo.updateStatus(jobId, "applied");

    return app;
  }
}
