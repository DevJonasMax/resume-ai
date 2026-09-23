import type { z } from "zod";
import { NON_DEPRECATED_GEMINI_MODELS, type GeminiModelName } from "@resume-ai/types";

export { NON_DEPRECATED_GEMINI_MODELS, type GeminiModelName };

/**
 * Universal AI provider contract decoupling the domain from specific LLM implementations.
 */
export interface AIProvider {
  /**
   * Generates a strongly-typed structured object adhering to a Zod schema.
   */
  generateStructured<T>(options: {
    schema: z.ZodType<T>;
    prompt: string;
    systemPrompt?: string;
    model?: string;
  }): Promise<T>;

  /**
   * Generates free-form text from a prompt.
   */
  generateText(options: {
    prompt: string;
    systemPrompt?: string;
    model?: string;
  }): Promise<string>;

  /**
   * Generates an asynchronous text stream for live UI updates.
   */
  streamText(options: {
    prompt: string;
    systemPrompt?: string;
    model?: string;
  }): Promise<AsyncIterable<string>>;
}

