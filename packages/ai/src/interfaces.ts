import type { z } from "zod";

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
  }): Promise<T>;

  /**
   * Generates free-form text from a prompt.
   */
  generateText(options: {
    prompt: string;
    systemPrompt?: string;
  }): Promise<string>;
}
