# AGENTS.md

Welcome to the **AI Job Application Agent** repository. This document establishes guidelines, architectural principles, commands, and conventions for AI agents and engineers working in this codebase.

---

## 1. Architectural Principles and Workspace Rules

1. **Turborepo Monorepo Structure**:
   - `apps/web`: Vinext (Vite + Next.js App Router) web application.
   - `apps/api`: REST and SSE API server.
   - `apps/cli`: First-class interactive and scriptable CLI tool.
   - `packages/types`: Shared contracts, Zod schemas, and TypeScript interfaces.
   - `packages/config`: Centralized environment configuration and validation.
   - `packages/database`: Persistence layer using SQLite and Drizzle ORM.
   - `packages/ai`: AI provider abstraction (Gemini, Vercel AI SDK, Google GenAI SDK).
   - `packages/jev`: TypeSafe AI Jev System One decision engine.
   - `packages/browser`: Browser automation service abstraction and agent-browser adapter.
   - `packages/jobs`: Job domain, extraction pipeline, and gap analysis.
   - `packages/resume`: Resume domain, tailoring pipeline, multi-provider PDF engine (Typst, React-PDF, deprecated LaTeX).
   - `packages/applications`: Application domain, lifecycle state machine, and human-in-the-loop coordinator.

2. **Domain Isolation & Dependency Inversion**:
   - Business logic belongs strictly in domain and application packages (`packages/`), never inside UI components, CLI handlers, or API route controllers.
   - Web and CLI applications consume the same underlying application services.
   - Never import implementation details across bounded contexts. Program against interfaces (`AIProvider`, `BrowserAutomationService`, `JobRepository`).

3. **TypeScript Standards**:
   - Strict mode is mandatory (`strict: true`).
   - Never use `any` under any circumstances. Always use strict types, generics, or `unknown` when dynamic data must be handled.
   - Never use regular code comments that explain what the code does. Use JSDoc/TSDoc exclusively for public APIs, complex business logic, or architectural rationale.

4. **Formatting and Punctuation**:
   - Never use em dashes (—). Use colons, commas, periods, or parentheses instead.
   - Write all code, tests, logs, error messages, and documentation strictly in English.

---

## 2. Development Workflow and Commands

Use `pnpm` and `rtk` (Rust Token Killer) whenever possible:

- **Build**:
  ```bash
  pnpm build
  ```
- **Type Checking**:
  ```bash
  rtk tsc --noEmit
  ```
- **Testing**:
  ```bash
  pnpm test
  ```
- **Linting**:
  ```bash
  rtk lint
  ```
- **Development**:
  ```bash
  pnpm dev
  ```

---

## 3. Working with Task Management (`/docs/tasks`)

1. Task files live under `/docs/tasks/`.
2. `TSK-000-global.md` acts as the master implementation index.
3. Every task must have a checkbox `- [ ]`.
4. When implementing features, work in small vertical slices.
5. Update the corresponding task checkbox `- [x]` after the slice is completed and verified.
6. Never renumber task IDs once defined.

---

## 4. Semantic Commits

All commits must follow semantic commit conventions:

- `feat(scope): add new feature`
- `fix(scope): resolve issue`
- `refactor(scope): restructure without behavior change`
- `test(scope): add or update test suites`
- `docs(scope): update documentation`
- `chore(scope): repository maintenance`

Do not create vague or uninformative commit messages.

---

## 5. Safety and Browser Automation Invariants

1. **Safety First**: Never submit an application automatically if there is ambiguity in required form fields or candidate confirmation.
2. **State Veracity**: Never mark an application as `applied` unless cryptographic or verified submission evidence is returned by the browser session.
3. **Human Intervention**: The browser automation engine must yield control to the human user when encountering CAPTCHAs, multi-factor authentication, or unrecognized interactive widgets.

---

## 6. PDF Generation Architecture and Invariants

1. **Agnostic Document Contract**: The AI Agent must produce strictly structured, typed JSON conforming to `ResumeDocumentSchema` (`packages/types`). The AI Agent must NEVER output LaTeX, Typst, JSX, HTML, or renderer-specific markup.
2. **Isolated Renderer Adapters**: Each renderer (`TypstProvider`, `ReactPdfProvider`, `LegacyLaTeXProvider`) translates the canonical `ResumeDocument` into its own template layout.
3. **Environment Selection**: The default provider is controlled via `PDF_PROVIDER` (`typst` by default). The legacy LaTeX compiler remains exclusively as a `@deprecated` fallback.
