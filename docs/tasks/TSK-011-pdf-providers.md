# TSK-011: Multi-Provider PDF Generation Architecture (Typst & React-PDF)

## Description

Refactor the resume generation subsystem to decouple from LaTeX, deprecate the legacy LaTeX compiler, and establish an agnostic, provider-based PDF generation architecture. The AI Agent must generate strictly structured, typed, renderer-agnostic JSON (`ResumeDocument`). Introduce `Typst` as the primary default provider and `@react-pdf/renderer` as an alternative provider, selectable via environment variable (`PDF_PROVIDER`).

## Depends

- TSK-004
- TSK-005
- TSK-008

## Tasks

- [x] TSK-011.1: Define canonical, renderer-agnostic `ResumeDocument` schema and contract in `packages/types`
- [x] TSK-011.2: Add environment configuration for `PDF_PROVIDER` (`typst` | `react-pdf` | `latex`) in `packages/config`
- [x] TSK-011.3: Update database schema and `ResumeRepository` in `packages/database` to persist agnostic `resume_data_json` with backward-compatible legacy column support
- [x] TSK-011.4: Define `PDFProvider` interface and `PDFProviderResolver` in `packages/resume`
- [x] TSK-011.5: Mark `LaTeXEngine` as `@deprecated` and encapsulate it in a legacy `LaTeXProvider`
- [x] TSK-011.6: Implement `TypstProvider` with dedicated typographic template and compiler runner in `packages/resume`
- [x] TSK-011.7: Implement `ReactPdfProvider` with React PDF template components in `packages/resume`
- [x] TSK-011.8: Refactor `ResumeTailoringService` so the AI Agent produces strictly structured `ResumeDocument` JSON without markup
- [x] TSK-011.9: Update API endpoints in `apps/api` (`GET /api/resumes/:id/pdf`, `PUT /api/resumes/:id/document`, deprecate `PUT /api/resumes/:id/latex`)
- [x] TSK-011.10: Update browser automation runner in `packages/browser` to upload native compiled PDF resumes instead of raw LaTeX
- [x] TSK-011.11: Update CLI resume generation in `apps/cli` to use the provider resolver and output compiled PDF
- [x] TSK-011.12: Refactor `ResumeStudio` in `apps/web` to integrate provider PDF preview and structured resume inspector/editor
- [x] TSK-011.13: Add unit tests validating that both Typst and React-PDF providers successfully render the identical `ResumeDocument`
