# TSK-004: AI Provider Abstraction

## Description

Implement the AI provider layer behind a clean `AIProvider` interface. Integrate Google Gemini via the Google GenAI SDK (`@google/genai`) and Vercel AI SDK. Provide structured generation with Zod validation, retries, and a deterministic offline mock provider for tests.

## Depends

- TSK-008

## Tasks

- [ ] TSK-004.1: Initialize `packages/ai` package with TypeScript configuration
- [ ] TSK-004.2: Define `AIProvider` interface with structured schema generation and text generation methods
- [ ] TSK-004.3: Implement `GeminiProvider` using Google GenAI SDK and Vercel AI SDK
- [ ] TSK-004.4: Implement `MockAIProvider` with deterministic outputs for testing and offline development
- [ ] TSK-004.5: Implement provider factory with configuration-driven provider selection
- [ ] TSK-004.6: Add unit tests verifying schema validation, retries, and error transformation
