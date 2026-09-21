# TSK-002: Web Application

## Description

Implement the modern AI productivity web application using Vinext (Vite + Next.js App Router), Tailwind CSS 4, Base UI, and shadcn/ui. Apply Vercel Composition Patterns and Impeccable design principles throughout. Features include an interactive Kanban job board, a Prism-inspired LaTeX résumé editor, job detail views, and a live agent execution monitor with human-in-the-loop controls.

## Depends

- TSK-001
- TSK-008

## Tasks

- [x] TSK-002.1: Initialize `apps/web` with Vinext, Vite, and Tailwind CSS 4
- [x] TSK-002.2: Configure Base UI accessible primitives and shadcn/ui styling tokens
- [x] TSK-002.3: Establish layout shell with navigation, theme toggles, and responsive navigation
- [x] TSK-002.4: Implement Dashboard overview page with statistics and recent activities
- [x] TSK-002.5: Implement interactive Kanban board with drag-and-drop column transitions
- [x] TSK-002.6: Implement Job Details page with structured requirements and candidate gap analysis
- [x] TSK-002.7: Implement Prism-inspired AI LaTeX Resume Editor with side-by-side structured editing and raw LaTeX source
- [x] TSK-002.8: Implement Agent Execution Monitor with live SSE streaming and screenshot previews
- [x] TSK-002.9: Implement Human-in-the-Loop intervention modal for user guidance and approval
- [x] TSK-002.10: Fix Resume Studio tab switching (`visual`, `diffs`, `latex`) via compound `ResumeEditor.Content`
- [x] TSK-002.11: Implement client-side PDF resume export via `html2pdf.js` with print stylesheet
- [x] TSK-002.12: Implement Multi-Candidate Profile view with profile switching, deletion, and active status
- [x] TSK-002.13: Implement Candidate Import Modal supporting PDF file upload, text paste, and manual forms
- [x] TSK-002.14: Implement interactive Agent Refine drawer for on-demand LaTeX resume prompt optimization
- [x] TSK-002.15: Setup shadcn/ui primitives, Tailwind CSS 4 design tokens, and custom anti-AI-slop design system
- [x] TSK-002.16: Implement Resume Studio 50/50 split workspace (LaTeX Code Editor on Left, Rendered PDF Preview on Right)
- [x] TSK-002.17: Implement interactive ATS Tailoring Diff Inspector and AI modification highlights
- [x] TSK-002.18: Integrate SmoothUI AI Conversation component for interactive Agent dialogue and prompt refinement
- [x] TSK-002.19: Refactor component hierarchy using Vercel Composition Patterns (Compound components, decoupled state, React 19)
- [x] TSK-002.20: Verification, code review of Dev Frontend changes, and runtime testing with Server agent
- [x] TSK-002.21: Fix runtime error on undefined job status in Kanban board & add defensive data filters
- [x] TSK-002.22: Refactor app layout to Dashboard Shell with left sidebar and right content viewport
- [x] TSK-002.23: Implement in-studio Job and Candidate selectors in Resume Studio Header with auto-loading
- [x] TSK-002.24: Redesign color palette to OpenAI Prism pastel aesthetic (soft sage, lavender, apricot, slate) eliminating AI slop
- [x] TSK-002.25: Migrate all icons from Lucide to HugeIcons (@hugeicons/react and @hugeicons/core-free-icons)
- [x] TSK-002.26: Verification, typecheck, build validation, and Server runtime test
- [x] TSK-002.27: Fix LaTeX Code Editor container sizing, flex layout, and gutter line synchronization
- [x] TSK-002.28: Real LaTeX compiler integration (WebAssembly `@typeward/texlive-wasm` or compiler pipeline) and PDF blob preview rendering (replacing fake HTML interpretation & html2pdf)
- [x] TSK-002.29: Smooth-UI AI Chat bottom bar docking station with animated expansion and smooth transition
- [x] TSK-002.30: Internationalization (intl / i18n) support for `en_US` and `pt_BR` with locale switcher and typed dictionaries
- [x] TSK-002.31: Debugging and visual verification via `<maestri-canvas-portal name="Web" />`
- [x] TSK-002.32: Maestro final verification, strict typecheck, and build validation
