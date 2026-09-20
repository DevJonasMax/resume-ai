import { appConfig } from "@resume-ai/config";
import { GeminiProvider } from "./gemini.js";
import type { AIProvider } from "./interfaces.js";
import { MockAIProvider } from "./mock.js";

let aiProviderInstance: AIProvider | null = null;

/**
 * Returns the configured AI provider, falling back gracefully to MockAIProvider when credentials are unset.
 */
export function getAIProvider(): AIProvider {
  if (aiProviderInstance) {
    return aiProviderInstance;
  }

  if (appConfig.geminiApiKey) {
    aiProviderInstance = new GeminiProvider(appConfig.geminiApiKey);
  } else {
    aiProviderInstance = new MockAIProvider();
  }

  return aiProviderInstance;
}
