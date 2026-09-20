# CODE_QUALITY.md: Engineering Standards and Quality Guidelines

This document outlines the software craftsmanship standards, typing conventions, testing strategies, and quality invariants enforced across the **AI Job Application Agent** codebase.

---

## 1. Core Principles

1. **SOLID Architecture**:
   - **Single Responsibility**: Each class, module, and package has one reason to change.
   - **Open/Closed**: Core domain engines allow extension via interfaces without modifying internal domain rules.
   - **Liskov Substitution**: Provider adapters (`AIProvider`, `BrowserAutomationService`) must be fully interchangeable without altering client behavior.
   - **Interface Segregation**: Clients depend only on specific, focused interfaces.
   - **Dependency Inversion**: High-level application services depend on abstractions, not concrete third-party SDKs.

2. **KISS & YAGNI**:
   - Favor clear, direct solutions over speculative abstractions.
   - Build only packages and features that satisfy explicit system requirements.

3. **DRY (Don't Repeat Yourself)**:
   - Shared business logic, schemas, and types reside exclusively in shared domain packages (`packages/*`).
   - Web UI, API, and CLI reuse identical application services.

---

## 2. TypeScript and Typing Standards

1. **Strict Mode Enabled**:
   - `strict: true` and `noImplicitAny: true` are required across all packages.
2. **Zero Any Policy**:
   - Never use `any` under any circumstances.
   - Use strict interfaces, mapped types, discriminated unions, generics, or `unknown` when handling dynamic external inputs.
   - Parse untrusted external inputs using Zod schemas at system boundaries.
3. **Documentation Strategy**:
   - Do not write trivial comments that simply restate what the code performs.
   - Write self-documenting code with clear variable and function names.
   - Use TSDoc/JSDoc format exclusively for:
     - Public API contracts
     - Complex architectural patterns
     - Explanations of why a specific technical choice was made

---

## 3. Error Handling and Observability

1. **Custom Domain Errors**:
   - Domain errors inherit from a base `AppError` and carry structured context, error codes, and operational flags.
   - Avoid catching errors simply to swallow them. Always handle errors or rethrow with structured context.
2. **Observability**:
   - Emit structured logs carrying timestamps, severity levels, component tags, and contextual identifiers (`jobId`, `runId`).
   - Sensitive credentials (such as API keys or user passwords) must never appear in logs or client payloads.

---

## 4. Frontend Component Architecture

1. **Composition Over Configuration**:
   - Follow Vercel Composition Patterns: prefer compound components (`Dialog.Trigger`, `Dialog.Content`, `Dialog.Footer`) over monolithic components with bloated boolean props.
   - Lift shared state to context providers when sibling components need coordinated access.
   - Use explicit variant components instead of conditional mode props.
2. **Design Standards**:
   - Follow Impeccable guidelines: prioritize typography, distinct information hierarchy, responsive layouts, keyboard accessibility, loading states, error states, and meaningful feedback.
   - Styling must be implemented with Tailwind CSS 4 and Base UI headless primitives.

---

## 5. Testing Requirements

1. **Unit Testing**:
   - All domain services (`JobAnalysisService`, `ResumeTailoringService`, `ApplicationLifecycleManager`, `LaTeXGenerator`) must have thorough unit tests.
2. **Contract Testing**:
   - Validate API contracts and Zod schemas against expected mock payloads.
3. **Deterministic Testing**:
   - Unit and integration tests must run offline with deterministic mock providers for AI and browser automation.
