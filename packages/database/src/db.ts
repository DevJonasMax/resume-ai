import fs from "node:fs";
import path from "node:path";
import { appConfig } from "@resume-ai/config";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

/**
 * Finds the monorepo root directory by looking for pnpm-workspace.yaml.
 */
function findWorkspaceRoot(startDir: string = process.cwd()): string {
  let current = startDir;
  while (true) {
    if (fs.existsSync(path.join(current, "pnpm-workspace.yaml"))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return startDir;
    }
    current = parent;
  }
}

/**
 * Initializes and bootstraps the SQLite database connection with required schema.
 */
function initializeDatabase() {
  const workspaceRoot = findWorkspaceRoot();
  const dbPath = path.isAbsolute(appConfig.databaseUrl)
    ? appConfig.databaseUrl
    : path.resolve(workspaceRoot, appConfig.databaseUrl);
  const dirPath = path.dirname(dbPath);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  // Bootstrap schema DDL directly if tables do not exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS candidate_profiles (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      location TEXT NOT NULL,
      summary TEXT NOT NULL,
      experiences_json TEXT NOT NULL,
      skills_json TEXT NOT NULL,
      education_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      url TEXT,
      location TEXT,
      source TEXT NOT NULL DEFAULT 'manual',
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'discovered',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS job_requirements (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      seniority_level TEXT NOT NULL,
      work_model TEXT NOT NULL DEFAULT 'unspecified',
      location_requirements TEXT,
      education_requirement TEXT,
      experience_years_required INTEGER,
      skills_json TEXT NOT NULL,
      responsibilities_json TEXT NOT NULL,
      keywords_json TEXT NOT NULL,
      gap_analysis_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resume_versions (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      latex_source TEXT NOT NULL,
      diff_items_json TEXT NOT NULL,
      tailored_summary TEXT NOT NULL,
      tailored_experience_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'discovered',
      submission_verified INTEGER NOT NULL DEFAULT 0,
      submission_proof TEXT,
      applied_at TEXT,
      runs_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agent_runs (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'queued',
      started_at TEXT NOT NULL,
      ended_at TEXT,
      events_json TEXT NOT NULL DEFAULT '[]',
      intervention_json TEXT,
      submission_proof TEXT,
      error_message TEXT
    );
  `);

  return drizzle(sqlite, { schema });
}

export type AppDatabase = ReturnType<typeof initializeDatabase>;

let databaseInstance: AppDatabase | null = null;

/**
 * Accesses the singleton database instance.
 */
export function getDb(): AppDatabase {
  if (!databaseInstance) {
    databaseInstance = initializeDatabase();
  }
  return databaseInstance;
}
