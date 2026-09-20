# TSK-006: Browser Automation Layer

## Description

Implement the browser automation abstraction behind the `BrowserAutomationService` interface. Wrap `agent-browser` native CLI capabilities, parse element tables for Jev decision-making, and implement human-in-the-loop interrupters for safety.

## Depends

- TSK-007
- TSK-008

## Tasks

- [ ] TSK-006.1: Initialize `packages/browser` package with TypeScript configuration
- [ ] TSK-006.2: Define `BrowserAutomationService` interface (`open`, `snapshot`, `click`, `fill`, `upload`, `screenshot`)
- [ ] TSK-006.3: Implement `AgentBrowserAdapter` executing commands via `agent-browser` CLI
- [ ] TSK-006.4: Implement accessibility tree parser generating element tables (`[1] button Submit`, `[2] textbox Email`)
- [ ] TSK-006.5: Implement human-in-the-loop detection (CAPTCHAs, multi-factor authentication, ambiguous questions)
- [ ] TSK-006.6: Implement deterministic `MockBrowserService` for isolated unit and integration testing
- [ ] TSK-006.7: Add unit tests for element table parsing and action dispatching
