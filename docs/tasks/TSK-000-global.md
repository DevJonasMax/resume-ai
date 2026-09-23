# TSK-000: Global Implementation Roadmap

## Overview

Master implementation roadmap for the **AI Job Application Agent** monorepo. This roadmap outlines the vertical slice execution order, dependencies, and synchronization points across all domain packages and applications.

---

## Task Index

- [x] [TSK-001: API Application](file:///D:/projetos/resume-ai/docs/tasks/TSK-001-api.md)
- [x] [TSK-002: Web Application (Compiler, Smooth-UI Chat, intl i18n)](file:///C:/Users/Wesley%20Maik/Documents/Projects/resume-ai/docs/tasks/TSK-002-web.md)
- [x] [TSK-003: CLI Application](file:///D:/projetos/resume-ai/docs/tasks/TSK-003-cli.md)
- [x] [TSK-004: AI Provider Abstraction](file:///D:/projetos/resume-ai/docs/tasks/TSK-004-ai.md)
- [x] [TSK-005: Resume & LaTeX Domain](file:///D:/projetos/resume-ai/docs/tasks/TSK-005-resume.md)
- [x] [TSK-006: Browser Automation Layer](file:///D:/projetos/resume-ai/docs/tasks/TSK-006-browser.md)
- [x] [TSK-007: Jev Decision Integration](file:///D:/projetos/resume-ai/docs/tasks/TSK-007-jev.md)
- [x] [TSK-008: Database & Persistence](file:///D:/projetos/resume-ai/docs/tasks/TSK-008-database.md)
- [ ] [TSK-009: Testing Infrastructure](file:///D:/projetos/resume-ai/docs/tasks/TSK-009-testing.md)
- [x] [TSK-010: Documentation & Guides](file:///D:/projetos/resume-ai/docs/tasks/TSK-010-documentation.md)
- [x] [TSK-011: Multi-Provider PDF Engine (Typst & React-PDF)](file:///C:/Users/Wesley%20Maik/Documents/Projects/resume-ai/docs/tasks/TSK-011-pdf-providers.md)
- [x] [TSK-012: Platform Job Integrations (LinkedIn, Gupy, Nerdin, Programathor, micro1, Glassdoor, GeekHunter, Revelo, Catho, Indeed)](file:///C:/Users/Wesley%20Maik/Documents/Projects/resume-ai/docs/tasks/TSK-012-job-integrations.md)
- [x] [TSK-013: Vercel AI SDK Integration & Real Assistant Engine](file:///C:/Users/Wesley%20Maik/Documents/Projects/resume-ai/docs/tasks/TSK-013-ai-sdk-streaming.md)
- [x] [TSK-014: UI/UX Modernization, Micro-Interactions & SmoothUI AI Chat](file:///C:/Users/Wesley%20Maik/Documents/Projects/resume-ai/docs/tasks/TSK-014-ui-ux-microinteractions.md)

---

## Implementation Execution Sequence

```mermaid
graph TD
    T008[TSK-008: Database & Persistence] --> T004[TSK-004: AI Abstraction]
    T008 --> T007[TSK-007: Jev Decision Engine]
    T004 --> T005[TSK-005: Resume & LaTeX Engine]
    T007 --> T005
    T007 --> T006[TSK-006: Browser Automation]
    T008 --> T001[TSK-001: API Foundation]
    T005 --> T001
    T006 --> T001
    T001 --> T002[TSK-002: Web UI (Vinext + Base UI)]
    T001 --> T003[TSK-003: CLI Tool]
    T001 --> T009[TSK-009: Test Infrastructure]
    T009 --> T010[TSK-010: Documentation Verification]
```

---

## Phase Milestones

### Phase 1: Foundations & Core Data Model
- Initialize Turborepo, pnpm workspaces, and TypeScript configuration.
- Implement `packages/types` with complete Zod schemas and domain contracts.
- Implement `packages/config` with strict environment variable validation.
- Implement `packages/database` with SQLite schema, Drizzle ORM, and seed data.

### Phase 2: AI, Decision Making & LaTeX Tailoring
- Implement `packages/ai` with Gemini provider, Vercel AI SDK integration, and deterministic mock.
- Implement `packages/jev` with TypeSafe AI System One integration and confidence routing.
- Implement `packages/jobs` with job extraction, requirement scoring, and gap analysis.
- Implement `packages/resume` with grounded tailoring, LaTeX rendering, and version diffing.

### Phase 3: Browser Automation & Safety Coordinator
- Implement `packages/browser` with `agent-browser` adapter, element table parser, and human-in-the-loop detection.
- Implement `packages/applications` with lifecycle state machine and verification safeguards.

### Phase 4: Consumer Applications (API, Web, CLI)
- Implement `apps/api` with Fastify REST endpoints, multi-candidate routes, and SSE real-time telemetry.
- Implement `apps/cli` with interactive wizard and direct scriptable subcommands.
- Implement `apps/web` with Vinext, Tailwind CSS 4, Base UI, Kanban board, multi-candidate profile manager, and Resume Studio with live view switching, PDF export, and Agent refinement.

### Phase 5: Verification, Hardening & Automated Testing
- End-to-end interactive manual validation across Web UI and CLI application flows (Completed).
- Automated test suites (`TSK-009`: Unit, Integration, and E2E browser tests) planned for post-MVP hardening.
- Comprehensive documentation updates and task audits (Completed).
