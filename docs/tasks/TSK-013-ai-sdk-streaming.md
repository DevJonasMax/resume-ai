# TSK-013: Vercel AI SDK Integration & Real Assistant Engine

## Description

Migrate from Google GenAI SDK (`@google/genai`) to Vercel AI SDK (`ai` and `@ai-sdk/google`). Establish `GEMINI_MODEL` environment configuration with non-deprecated Gemini models (gemini-2.0-flash, gemini-2.0-flash-lite, gemini-2.5-pro, gemini-2.5-flash, gemini-1.5-pro, gemini-1.5-flash). Provide real assistant execution (removing mock reliance when credentials exist), real-time token streaming, dynamic model selection, and explicit error message surfacing without generic masks.

## Depends

- TSK-004
- TSK-005

## Tasks

- [x] TSK-013.1: Add `GEMINI_MODEL` to `packages/config` environment schema and update `.env` / `.env.example`
- [x] TSK-013.2: Install `@ai-sdk/google` and implement `VercelGeminiProvider` conforming to `AIProvider`
- [x] TSK-013.3: Implement text streaming, structured object generation, and model selection in `packages/ai`
- [x] TSK-013.4: Implement real-time streaming endpoint or SSE adapter in `apps/api`
- [x] TSK-013.5: Surface descriptive error responses from API to frontend with clear root-cause messages
- [x] TSK-013.6: Integrate non-deprecated Gemini model options selector in `AiChatDock`
- [x] TSK-013.7: Validate live resume refinement and candidate assistance with active API credentials
