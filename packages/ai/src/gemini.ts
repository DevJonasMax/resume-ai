import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { appConfig } from "@resume-ai/config";
import { generateObject, generateText, streamText } from "ai";
import type { z } from "zod";
import {
  type AIProvider,
  NON_DEPRECATED_GEMINI_MODELS,
  type GeminiModelName,
} from "./interfaces.js";

/**
 * Extracts and formats the deepest actionable error message from any provider failure,
 * ensuring no generic masks obscure the root cause from the caller.
 */
function extractDetailedErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const errorObj = err as unknown as Record<string, unknown>;
    const details: string[] = [err.message];
    const statusCode = errorObj["statusCode"];
    if (typeof statusCode === "number") {
      details.push(`HTTP ${statusCode}`);
    }
    const responseBody = errorObj["responseBody"];
    if (typeof responseBody === "string" && responseBody.trim()) {
      details.push(responseBody.trim());
    }
    const cause = errorObj["cause"];
    if (cause && cause !== err) {
      const causeMsg = cause instanceof Error ? cause.message : String(cause);
      if (!details.includes(causeMsg)) {
        details.push(`Cause: ${causeMsg}`);
      }
    }
    return details.join(" - ");
  }
  return String(err);
}

/**
 * Concrete implementation of AIProvider utilizing Google Gemini models via Vercel AI SDK.
 */
export class GeminiProvider implements AIProvider {
  private readonly googleClient: ReturnType<typeof createGoogleGenerativeAI>;
  private readonly defaultModel: GeminiModelName;

  constructor(apiKey?: string, modelName?: string) {
    const key = apiKey || appConfig.geminiApiKey;
    if (!key) {
      throw new Error("GEMINI_API_KEY is required to instantiate GeminiProvider");
    }

    const requestedModel = (modelName || appConfig.geminiModel || "gemini-3.8-flash").trim();
    this.defaultModel = NON_DEPRECATED_GEMINI_MODELS.includes(requestedModel as GeminiModelName)
      ? (requestedModel as GeminiModelName)
      : "gemini-3.8-flash";

    this.googleClient = createGoogleGenerativeAI({
      apiKey: key,
    });
  }

  /**
   * Resolves the target model ensuring it is supported and locked to non-deprecated Gemini models.
   */
  private resolveModel(modelOverride?: string): GeminiModelName {
    if (!modelOverride) {
      return this.defaultModel;
    }

    const trimmed = modelOverride.trim();
    if (NON_DEPRECATED_GEMINI_MODELS.includes(trimmed as GeminiModelName)) {
      return trimmed as GeminiModelName;
    }

    // Fallback if deprecated or unrecognized model was provided
    return this.defaultModel;
  }

  public async generateStructured<T>(options: {
    schema: z.ZodType<T>;
    prompt: string;
    systemPrompt?: string;
    model?: string;
  }): Promise<T> {
    const targetModel = this.resolveModel(options.model);

    try {
      const result = await generateObject({
        model: this.googleClient(targetModel),
        schema: options.schema,
        prompt: options.prompt,
        ...(options.systemPrompt ? { system: options.systemPrompt } : {}),
      });

      return result.object;
    } catch (err: unknown) {
      const detailed = extractDetailedErrorMessage(err);
      throw new Error(`Gemini Provider Structured Generation Failure (${targetModel}): ${detailed}`, {
        cause: err,
      });
    }
  }

  public async generateText(options: {
    prompt: string;
    systemPrompt?: string;
    model?: string;
  }): Promise<string> {
    const targetModel = this.resolveModel(options.model);

    try {
      const { text } = await generateText({
        model: this.googleClient(targetModel),
        prompt: options.prompt,
        ...(options.systemPrompt ? { system: options.systemPrompt } : {}),
      });

      return text;
    } catch (err: unknown) {
      const detailed = extractDetailedErrorMessage(err);
      throw new Error(`Gemini Provider Text Generation Failure (${targetModel}): ${detailed}`, {
        cause: err,
      });
    }
  }

  public async streamText(options: {
    prompt: string;
    systemPrompt?: string;
    model?: string;
  }): Promise<AsyncIterable<string>> {
    const targetModel = this.resolveModel(options.model);

    try {
      const result = streamText({
        model: this.googleClient(targetModel),
        prompt: options.prompt,
        ...(options.systemPrompt ? { system: options.systemPrompt } : {}),
      });

      async function* iterateStream() {
        try {
          for await (const chunk of result.textStream) {
            yield chunk;
          }
        } catch (streamErr: unknown) {
          const detailed = extractDetailedErrorMessage(streamErr);
          throw new Error(`Gemini Provider Streaming Iteration Failure (${targetModel}): ${detailed}`, {
            cause: streamErr,
          });
        }
      }

      return iterateStream();
    } catch (err: unknown) {
      const detailed = extractDetailedErrorMessage(err);
      throw new Error(`Gemini Provider Streaming Failure (${targetModel}): ${detailed}`, { cause: err });
    }
  }
}

/**
 * Alias conforming to task TSK-013 requirement.
 */
export { GeminiProvider as VercelGeminiProvider };
