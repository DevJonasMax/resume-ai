# TSK-005: Resume Domain & LaTeX Generation

## Description

Implement the résumé domain, candidate profile models, grounded tailoring pipeline, and LaTeX generator modeled after `resume-example-01.tex`. Ensure generated content is strictly grounded in candidate truth while optimizing vocabulary for target jobs.

## Depends

- TSK-004
- TSK-007
- TSK-008

## Tasks

- [ ] TSK-005.1: Initialize `packages/resume` package with TypeScript configuration
- [ ] TSK-005.2: Implement candidate profile domain models and schema definitions
- [ ] TSK-005.3: Implement grounded résumé tailoring pipeline optimizing bullet points and keywords
- [ ] TSK-005.4: Implement LaTeX template engine based on `resume-example-01.tex` macros (`\resumeItem`, `\resumeSubheading`)
- [ ] TSK-005.5: Implement LaTeX syntax sanitizer (escaping special TeX characters)
- [ ] TSK-005.6: Implement structured version diff engine tracking additions, modifications, and removals
- [ ] TSK-005.7: Add comprehensive unit tests verifying LaTeX generation correctness and truth grounding
