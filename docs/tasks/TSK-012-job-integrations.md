# TSK-012: Platform Job Integrations

## Description

Implement automated job extraction and platform detection across the 10 major recruitment platforms: LinkedIn, Gupy, Nerdin, Programathor, micro1, Glassdoor, GeekHunter, Revelo, Catho, and Indeed. Provide reliable structured extraction (title, company, location, requirements, description) with visual platform badges, icons, and supported platforms reference in the UI.

## Depends

- TSK-001
- TSK-004
- TSK-008

## Tasks

- [x] TSK-012.1: Implement `JobPlatformDetector` with domain pattern matching and metadata for the 10 target platforms
- [x] TSK-012.2: Implement `JobExtractionService` leveraging JSON-LD Schema (JobPosting), platform meta-tags, and structured AI fallback
- [x] TSK-012.3: Implement API endpoints `POST /api/jobs/extract` and `GET /api/jobs/supported-platforms`
- [x] TSK-012.4: Integrate platform icons and instant URL detection in `AddJobModal`
- [x] TSK-012.5: Implement automated pre-fill ("Preencher via Link" / "Autofill from Link") with loading state
- [x] TSK-012.6: Add "Supported Platforms" interactive preview and pill badges in UI
- [x] TSK-012.7: Verification of job link ingestion and Kanban card rendering
