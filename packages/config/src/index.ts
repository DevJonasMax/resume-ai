import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadDotenv();

const EnvironmentSchema = z.object({
  GEMINI_API_KEY: z.string().optional(),
  TYPESAFE_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().default("./data/resume-ai.sqlite"),
  SERVER_PORT: z.coerce.number().default(3001),
  API_URL: z.string().default("http://localhost:3001"),
  BROWSER_HEADLESS: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsedEnv = EnvironmentSchema.parse(process.env);

/**
 * Validated application configuration parameters.
 */
export interface AppConfig {
  geminiApiKey: string | undefined;
  typesafeApiKey: string | undefined;
  databaseUrl: string;
  serverPort: number;
  apiUrl: string;
  browserHeadless: boolean;
  isProduction: boolean;
  nodeEnv: "development" | "test" | "production";
}

/**
 * Singleton configuration instance validated at startup.
 */
export const appConfig: AppConfig = {
  geminiApiKey: parsedEnv.GEMINI_API_KEY,
  typesafeApiKey: parsedEnv.TYPESAFE_API_KEY,
  databaseUrl: parsedEnv.DATABASE_URL,
  serverPort: parsedEnv.SERVER_PORT,
  apiUrl: parsedEnv.API_URL,
  browserHeadless: parsedEnv.BROWSER_HEADLESS,
  isProduction: parsedEnv.NODE_ENV === "production",
  nodeEnv: parsedEnv.NODE_ENV,
};
