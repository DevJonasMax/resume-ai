# TSK-003: CLI Application

## Description

Implement the first-class terminal CLI tool (`job-agent`) reusing core domain application services. Supports both an interactive wizard mode for guided workflows and direct scriptable subcommands for automated pipelines.

## Depends

- TSK-004
- TSK-005
- TSK-006
- TSK-007
- TSK-008

## Tasks

- [ ] TSK-003.1: Initialize `apps/cli` with Commander and TypeScript binary packaging
- [ ] TSK-003.2: Implement interactive wizard flow (`job-agent` with no arguments)
- [ ] TSK-003.3: Implement `job-agent add` command for manual and URL job submission
- [ ] TSK-003.4: Implement `job-agent analyze` command for triggering job requirement extraction
- [ ] TSK-003.5: Implement `job-agent resume` command for generating tailored LaTeX résumés
- [ ] TSK-003.6: Implement `job-agent apply` command for launching browser automation runs
- [ ] TSK-003.7: Implement `job-agent status` command for inspecting job and application lifecycles
- [ ] TSK-003.8: Add CLI output formatting with color-coded tables, spinners, and progress reporting
