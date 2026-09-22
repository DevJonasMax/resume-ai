# AI Job Application Agent

Autonomous AI-powered job application monorepo engineered with Turborepo, TypeSafe AI's Jev model, Google Gemini, agent-browser, and a Vinext Web UI.

---

## 1. Monorepo Overview

```text
/
├── apps/
│   ├── web/              # Vinext (Vite + Next.js App Router) + Tailwind CSS 4 + Base UI
│   ├── api/              # Fastify REST Server & SSE Realtime Stream
│   └── cli/              # First-class terminal tool (job-agent) with interactive wizard
│
├── packages/
│   ├── types/            # Shared contracts, Zod schemas, state enums
│   ├── config/           # Centralized environment validation
│   ├── database/         # SQLite persistence via Drizzle ORM
│   ├── ai/               # Gemini provider abstraction & structured outputs
│   ├── jev/              # TypeSafe AI Jev System One decision engine
│   ├── browser/          # agent-browser automation adapter & safe coordinator
│   ├── jobs/             # Job extraction, requirement scoring, gap analysis
│   ├── resume/           # Grounded resume tailoring, canonical ResumeDocument & multi-provider PDF engine
│   └── applications/     # Application lifecycle state machine & evidence verifier
│
├── docs/
│   └── tasks/           # Granular task management system (TSK-000 to TSK-011)
├── AGENTS.md             # Guidelines and commands for AI coding agents
├── ARCHITECTURE.md       # High-level architecture and domain sequence diagrams
├── CODE_QUALITY.md       # Engineering standards, zero-any policy, and safety rules
└── resume-example-01.tex # Canonical candidate profile and LaTeX reference macros
```

---

## 2. Core Capabilities

1. **Structured Requirement Extraction**: Ingests job descriptions and extracts seniority, work model, core skills, responsibilities, and keywords.
2. **Jev System One Decisions**: Evaluates requirement criticality and navigates browser actions (`CLICK`, `TYPE_TEXT`, `UPLOAD_RESUME`, `DONE`, `BLOCKED`) with calibrated confidence scores.
3. **Grounded Multi-Provider PDF Tailoring**: The AI Agent generates strictly structured, renderer-agnostic `ResumeDocument` JSON without markup. High-speed, publication-grade PDFs are synthesized natively via Typst (default) or `@react-pdf/renderer` (declarative alternative), with legacy LaTeX deprecated as fallback.
4. **Prism-Inspired Resume Workspace**: Interactive side-by-side workspace with live native PDF streaming, active engine switcher (Typst / React-PDF / LaTeX), AI improvement diffs with rationale, and source export.
5. **Visual Kanban Pipeline**: Drag-and-drop opportunity board tracking stages from `Discovered` to `Applied`.
6. **Safe Browser Automation**: Navigates job portals using `agent-browser` with a visible browser window by default for human inspection.
7. **Human-in-the-Loop Safety**: Detects CAPTCHAs, two-factor authentication, or ambiguous form fields, immediately pausing execution and awaiting human resolution.
8. **CLI & Web Parity**: Dual interfaces sharing identical underlying domain application services.

---

## 3. Quickstart

### Prerequisites

- Node.js `22.x` or later
- pnpm `10.x` or later
- `rtk` (Rust Token Killer) CLI proxy
- `typst` CLI v0.13+ (Installed via `winget install --id Typst.Typst` on Windows or `cargo install --locked typst-cli` / `brew install typst`)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Key variables:
- `GEMINI_API_KEY`: Google Gemini API key (optional: system runs in deterministic mock mode when unset).
- `TYPESAFE_API_KEY`: TypeSafe AI API key (optional: uses deterministic decision heuristics when unset).
- `PDF_PROVIDER`: PDF generation engine (`typst` as default, `react-pdf` as alternative, or `latex` as deprecated legacy).
- `TYPST_PATH`: Path to Typst executable (optional if installed globally).
- `BROWSER_HEADLESS`: Defaults to `false` (visible browser window for real-time human observation). Set to `true` for headless execution.
- `DATABASE_URL`: Path to local SQLite database file (`./data/resume-ai.sqlite`).

### 3. Seed Database

Initialize SQLite and seed the candidate profile from `resume-example-01.tex`:

```bash
pnpm --filter @resume-ai/database run seed
```

### 4. Start Development Servers

Run both the API server (port 3001) and Web UI (port 3000):

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. CLI Usage

The CLI tool can be executed interactively or via scriptable subcommands:

```bash
# Interactive guided wizard:
pnpm --filter @resume-ai/cli dev

# Scriptable commands:
pnpm --filter @resume-ai/cli dev list
pnpm --filter @resume-ai/cli dev add --title "Senior QA Automation Engineer" --company "Acme Corp" --description "5+ years Selenium Java"
pnpm --filter @resume-ai/cli dev analyze --job job-001
pnpm --filter @resume-ai/cli dev resume --job job-001
pnpm --filter @resume-ai/cli dev apply --job job-001
pnpm --filter @resume-ai/cli dev status --job job-001
```

---

## 5. Engineering Standards

- **Zero Any Policy**: Strict typing across all packages.
- **Dependency Inversion**: Domain packages never depend on UI, Fastify, or concrete third-party SDKs.
- **Truth Invariant**: Applications cannot be marked as `Applied` without verified submission proof.
