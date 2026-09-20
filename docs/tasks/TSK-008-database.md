# TSK-008: Database & Persistence Layer

## Description

Implement local zero-dependency database persistence using SQLite and Drizzle ORM (`better-sqlite3`). Define schemas for jobs, requirements, résumé versions, application attempts, and agent run telemetry. Include repositories and database seed scripts based on `resume-example-01.tex`.

## Depends

- None (Root package dependency)

## Tasks

- [x] TSK-008.1: Initialize `packages/database` package with Drizzle ORM and SQLite configuration
- [x] TSK-008.2: Define Drizzle schema tables (`jobs`, `job_requirements`, `resume_versions`, `applications`, `agent_runs`, `candidate_profiles`)
- [x] TSK-008.3: Implement repository classes (`JobRepository`, `ResumeRepository`, `ApplicationRepository`, `AgentRunRepository`, `CandidateRepository`)
- [x] TSK-008.4: Implement database migration runner and connection manager with automatic column migration
- [x] TSK-008.5: Implement seed script populating default candidate profile from `resume-example-01.tex` and sample jobs
- [x] TSK-008.6: Implement multi-candidate profile management methods in CandidateRepository (`getAllProfiles`, `getActiveProfile`, `setActiveProfile`, `deleteProfile`)
- [ ] TSK-008.7: Add unit and integration tests verifying CRUD operations and relationship integrity
