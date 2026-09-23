# TSK-014: UI/UX Modernization, Micro-Interactions & SmoothUI AI Chat

## Description

Polish the user interface and elevate user experience (UX) to make the application intuitive, delightful, and accessible. Implement SmoothUI-inspired AI Chat components with animated AI Avatars, comprehensive internationalization (full `pt_BR` and `en_US` coverage across all views and modals), micro-interactions (button active scaling, hover glow effects, toast notifications), and seamless integration with job platform indicators.

## Depends

- TSK-002
- TSK-012
- TSK-013

## Tasks

- [x] TSK-014.1: Implement SmoothUI AI Avatar component with idle, thinking/generating, and error visual states
- [x] TSK-014.2: Enhance `AiChatDock` with SmoothUI layout, model switcher dropdown, and streaming cursor
- [x] TSK-014.3: Audit and expand `en_US` and `pt_BR` locale dictionaries for complete coverage across all dialogs and views
- [x] TSK-014.4: Replace remaining hardcoded strings in `AddJobModal`, `JobDetailModal`, `ImportCandidateModal`, and `AiChatDock` with `useI18n`
- [x] TSK-014.5: Add micro-interactions (active button scaling, card hover elevation, pulse glows, and feedback toasts)
- [x] TSK-014.6: Implement visual error banner in AI Chat with retry action and error details toggle
- [x] TSK-014.7: Visual verification on `<maestri-canvas-portal name="Web" />`
