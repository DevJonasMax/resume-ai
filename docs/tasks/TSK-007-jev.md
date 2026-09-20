# TSK-007: Jev Decision Integration

## Description

Integrate TypeSafe AI's Jev model (`@typesafe-ai/sdk`) for contextual decision-making. Utilize Jev System One questions (`Choice`, `Score`, `Noul`) for job requirement scoring and browser navigation action selection, featuring confidence-gated routing.

## Depends

- TSK-008

## Tasks

- [x] TSK-007.1: Initialize `packages/jev` package with TypeScript configuration
- [x] TSK-007.2: Integrate `@typesafe-ai/sdk` and define decision interfaces
- [x] TSK-007.3: Implement browser operation selector (`CLICK`, `TYPE_TEXT`, `SELECT`, `WAIT`, `DONE`, `BLOCKED`)
- [x] TSK-007.4: Implement job requirement importance scoring and constraint evaluation
- [x] TSK-007.5: Implement confidence-gated routing with automatic human escalation threshold
- [x] TSK-007.6: Implement deterministic `MockJevClient` for offline testing and local development
- [ ] TSK-007.7: Add unit tests verifying decision mapping and confidence routing
