# ARCHITECTURE.md: AI Job Application Agent

This document details the high-level architecture, module boundaries, data flows, and design invariants of the **AI Job Application Agent** system.

---

## 1. System Topology

The system is organized as a Turborepo monorepo with distinct layers:

```mermaid
graph TD
    subgraph Presentation["Presentation Layer"]
        Web["apps/web (Vinext, Vite, Tailwind 4, Base UI, shadcn)"]
        CLI["apps/cli (Interactive Terminal & Scriptable Commands)"]
    end

    subgraph Transport["Transport & API Layer"]
        API["apps/api (Fastify REST Server & SSE Realtime Stream)"]
    end

    subgraph ApplicationCore["Core Application & Services Layer"]
        JobSvc["Job Application Service"]
        ResumeSvc["Resume Tailoring Service"]
        Orchestrator["Application Run Orchestrator"]
    end

    subgraph Domain["Domain Layer"]
        PkgJobs["packages/jobs"]
        PkgResume["packages/resume"]
        PkgApps["packages/applications"]
        PkgTypes["packages/types"]
    end

    subgraph Infrastructure["Infrastructure & Integrations"]
        PkgAI["packages/ai (Gemini & GenAI Provider)"]
        PkgJev["packages/jev (TypeSafe AI Jev Decision Engine)"]
        PkgBrowser["packages/browser (agent-browser / Playwright Automation)"]
        PkgDB["packages/database (SQLite + Drizzle ORM Repositories)"]
        PkgConfig["packages/config (Zod Validation)"]
    end

    Web -->|HTTP & SSE| API
    CLI -->|In-Process or API| ApplicationCore
    API --> ApplicationCore
    ApplicationCore --> Domain
    Domain --> Infrastructure
```

---

## 2. Monorepo Package Boundaries

| Package / App | Responsibility | Allowed Dependencies |
| :--- | :--- | :--- |
| `apps/web` | Client-side visual workspace, Kanban, Prism-inspired resume editor, execution monitor | `packages/types`, `packages/config` |
| `apps/api` | Thin HTTP routing, request validation, SSE streaming | `packages/types`, `packages/config`, `packages/jobs`, `packages/resume`, `packages/applications`, `packages/database` |
| `apps/cli` | Terminal interface with interactive wizards and direct commands | `packages/types`, `packages/config`, `packages/jobs`, `packages/resume`, `packages/applications`, `packages/database` |
| `packages/types` | Domain models, Zod schemas, state enums, DTOs | None (Zero external dependencies) |
| `packages/config` | Validated environment variables and constants | `packages/types` |
| `packages/database` | SQLite schema, migrations, Drizzle ORM repositories | `packages/types`, `packages/config` |
| `packages/ai` | LLM abstraction (`AIProvider`), Gemini adapter, structured schemas | `packages/types`, `packages/config` |
| `packages/jev` | TypeSafe AI System One decision engine, Choice/Score/Noul questions | `packages/types`, `packages/config` |
| `packages/browser` | Browser automation interface, `agent-browser` adapter, element parser | `packages/types`, `packages/config`, `packages/jev` |
| `packages/jobs` | Job ingestion, requirements extraction, gap analysis | `packages/types`, `packages/ai`, `packages/jev` |
| `packages/resume` | Resume tailoring, multi-provider PDF engine (Typst, React-PDF, deprecated LaTeX), version diffing | `packages/types`, `packages/ai` |
| `packages/applications`| Application lifecycle state machine, human-in-the-loop coordinator | `packages/types`, `packages/browser`, `packages/jev`, `packages/database` |

---

## 3. Core Domain Flows

### 3.1 Job Analysis and Requirement Extraction

```mermaid
sequenceDiagram
    participant User
    participant CLI_Web as Web / CLI
    participant JobService as Job Service
    participant Jev as TypeSafe Jev
    participant AI as Gemini Provider
    participant DB as SQLite DB

    User->>CLI_Web: Submit Job (URL or raw text)
    CLI_Web->>JobService: analyzeJob(jobId)
    JobService->>AI: Extract structured requirements
    AI-->>JobService: Raw requirements payload
    JobService->>Jev: Evaluate requirement criticality and constraints
    Jev-->>JobService: Calibrated importance scores
    JobService->>JobService: Perform candidate gap analysis
    JobService->>DB: Persist JobRequirements & Analysis
    JobService-->>CLI_Web: Structured Job Analysis Result
```

### 3.2 Agnostic Resume Tailoring and Multi-Provider PDF Generation

```mermaid
sequenceDiagram
    participant User
    participant ResumeService as Resume Tailoring Service
    participant AI as Gemini Provider
    participant Resolver as PDF Provider Resolver
    participant Provider as Typst / React-PDF Provider
    participant DB as SQLite DB

    User->>ResumeService: generateTailoredResume(jobId)
    ResumeService->>DB: Fetch JobRequirements & Candidate Profile
    DB-->>ResumeService: Candidate Data & Match Matrix
    ResumeService->>AI: Tailor summary & bullet points (grounded in candidate truth)
    AI-->>ResumeService: Tailored structured resume data (no markup)
    ResumeService->>ResumeService: Assemble canonical ResumeDocument JSON
    ResumeService->>Resolver: getPDFProvider()
    Resolver-->>ResumeService: Active PDF Provider (Typst / React-PDF)
    ResumeService->>Provider: renderPdf(resumeDocument)
    Provider-->>ResumeService: Compiled native PDF binary buffer
    ResumeService->>DB: Save new ResumeVersion (resumeDataJson + diff)
    ResumeService-->>User: Resume Version Ready with Compiled PDF
```

### 3.3 Safe Browser Application with Human-in-the-Loop

```mermaid
stateDiagram-v2
    [*] --> Discovered
    Discovered --> Analyzed: AI Job Analysis
    Analyzed --> ResumeReady: Generate Tailored Resume
    ResumeReady --> ReadyToApply: User Approves Resume
    ReadyToApply --> Applying: Launch Browser Agent
    
    state Applying {
        [*] --> Navigating
        Navigating --> Observing
        Observing --> JevDecision: Element Table Extracted
        JevDecision --> FormFilling: Confidence High
        JevDecision --> WaitingUser: Ambiguity or CAPTCHA Detected
        WaitingUser --> FormFilling: User Resolves & Resumes
        FormFilling --> Observing: Next Step
        FormFilling --> Submitting: Form Complete
    }

    Applying --> Applied: Verified Submission Evidence
    Applying --> ApplicationFailed: Unrecoverable Error
    Applied --> Interview: Recruiter Outreach
    Applied --> Archived: Closed / Completed
```

---

## 4. Design Invariants and Safety Guarantees

1. **Truth Grounding**: The résumé generator strictly optimizes presentation, vocabulary alignment, and impact framing based on existing candidate experience. It never fabricates companies, degrees, or years of tenure.
2. **Deterministic Fallbacks**: Every external AI or browser provider implements a deterministic mock adapter, guaranteeing end-to-end execution during automated testing and offline development.
3. **Verified Submission**: A transition to the `Applied` status strictly requires DOM proof of submission (such as confirmation page text, confirmation number, or application receipt URL).
4. **Renderer-Agnostic AI Output**: The AI Agent strictly produces validated JSON conforming to `ResumeDocumentSchema`. It never generates LaTeX, Typst, JSX, or HTML markup. Each rendering engine possesses its own isolated template adapter.
