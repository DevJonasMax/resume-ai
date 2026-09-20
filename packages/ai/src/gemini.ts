import { GoogleGenAI } from "@google/genai";
import { appConfig } from "@resume-ai/config";
import type { z } from "zod";
import type { AIProvider } from "./interfaces.js";

/**
 * Concrete implementation of AIProvider utilizing Google Gemini models via @google/genai.
 */
export class GeminiProvider implements AIProvider {
  private readonly client: GoogleGenAI;
  private readonly modelName: string;

  constructor(apiKey?: string, modelName = "gemini-2.5-flash") {
    const key = apiKey || appConfig.geminiApiKey;
    if (!key) {
      throw new Error("GEMINI_API_KEY is required to instantiate GeminiProvider");
    }
    this.client = new GoogleGenAI({ apiKey: key });
    this.modelName = modelName;
  }

  public async generateStructured<T>(options: {
    schema: z.ZodType<T>;
    prompt: string;
    systemPrompt?: string;
  }): Promise<T> {
    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents: [
        {
          role: "user",
          parts: [{ text: options.prompt }],
        },
      ],
      config: {
        ...(options.systemPrompt ? { systemInstruction: options.systemPrompt } : {}),
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text || "{}";
    const parsedJson: unknown = JSON.parse(rawText);
    return options.schema.parse(parsedJson);
  }

  public async generateText(options: {
    prompt: string;
    systemPrompt?: string;
  }): Promise<string> {
    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents: [
        {
          role: "user",
          parts: [{ text: options.prompt }],
        },
      ],
      ...(options.systemPrompt
        ? {
            config: {
              systemInstruction: options.systemPrompt,
            },
          }
        : {}),
    });

    return response.text || "";
  }
}
