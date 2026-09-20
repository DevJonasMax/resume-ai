# TSK-001: API Application

## Description

Implement the dedicated REST and Server-Sent Events (SSE) backend API using Fastify or Hono. Handlers must remain thin, delegating all domain logic to application services. Expose endpoints for job management, analysis, LaTeX résumé tailoring, application tracking, and real-time agent execution streaming.

## Depends

- TSK-004
- TSK-005
- TSK-006
- TSK-007
- TSK-008

## Tasks

- [x] TSK-001.1: Initialize `apps/api` package with TypeScript and server framework
- [x] TSK-001.2: Implement health check endpoint `GET /api/health`
- [x] TSK-001.3: Implement job management endpoints (`GET /api/jobs`, `POST /api/jobs`, `GET /api/jobs/:id`, `PUT /api/jobs/:id/status`)
- [x] TSK-001.4: Implement job analysis endpoint `POST /api/jobs/:id/analyze`
- [x] TSK-001.5: Implement résumé tailoring and version endpoints (`POST /api/jobs/:id/resume/generate`, `GET /api/jobs/:id/resume/latest`, `POST /api/resumes/:id/refine`, `PUT /api/resumes/:id/latex`)
- [x] TSK-001.6: Implement application launch endpoint `POST /api/jobs/:id/apply`
- [x] TSK-001.7: Implement SSE real-time streaming endpoint `GET /api/agent-runs/:id/stream`
- [x] TSK-001.8: Implement human intervention response endpoint `POST /api/agent-runs/:id/resume`
- [x] TSK-001.9: Implement candidate profile management and import endpoints (`GET /api/candidates`, `GET /api/candidate`, `PUT /api/candidates/:id/activate`, `DELETE /api/candidates/:id`, `POST /api/candidates`, `POST /api/candidates/import`)
- [ ] TSK-001.10: Add automated API contract test suites
