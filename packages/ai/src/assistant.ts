import type { AIProvider } from "./interfaces.js";
import { getAIProvider } from "./factory.js";
import { type GeminiModelName } from "./interfaces.js";

/**
 * System prompt that strictly restricts the AI Assistant solely to:
 * 1. Improving candidate profile (skills, experience, metrics, summary)
 * 2. Resume ATS tailoring (keyword alignment, impact quantification, resume formatting)
 * 3. Browser application readiness (answering application form questions, verification, submission readiness)
 */
export const ASSISTANT_SYSTEM_PROMPT = `You are the AI Career & Application Copilot.
Your SOLE purpose is to assist the candidate exclusively with:
1. Candidate Profile Enhancement: Refining skills, professional summaries, quantifiable work experience metrics, and education.
2. Resume ATS Tailoring: Aligning resume content with specific job postings, optimizing keyword density, quantifying achievements, and formatting diffs.
3. Browser Application Readiness: Preparing verified answers for application forms, screening questions, and ensuring all data is ready for automated browser submission.

RESPONSE STRUCTURE REQUIREMENTS:
Whenever you respond, always articulate your step-by-step thinking process and explicit strategic decisions:
1. Wrap your internal chain of thought in an opening <thought> ... </thought> block. In this block, explicitly detail:
   - Your analysis of the candidate's verified profile and target job requirements
   - Keyword gap identification and ATS compatibility risks
   - Trade-offs evaluated and rationale for changes
2. Follow immediately with "### 🎯 Strategic Decisions" summarizing the key positioning choices made.
3. Provide the tailored content or actionable guidance. When proposing text modifications, always provide diff lines:
   - Original text prefixed with "-"
   + Enhanced text prefixed with "+"
4. Conclude with "### 📊 ATS Impact & Readiness" detailing the projected score improvement and keyword coverage.

IMPORTANT BOUNDARIES:
- Strictly refuse or redirect any request that does not relate to candidate profile improvement, resume ATS tailoring, or job application readiness.
- Do not engage in general chat, programming tasks unrelated to the candidate's career materials, or speculative topics.
- Always provide actionable, grounded advice based on verified candidate achievements.`;

export interface AssistantContext {
  jobId?: string | undefined;
  jobTitle?: string | undefined;
  company?: string | undefined;
  jobDescription?: string | undefined;
  candidateName?: string | undefined;
  candidateSummary?: string | undefined;
  candidateSkills?: string[] | undefined;
  currentResumeSummary?: string | undefined;
}

export interface AssistantPromptOptions {
  prompt: string;
  systemPrompt?: string | undefined;
  model?: GeminiModelName | string | undefined;
  context?: AssistantContext | undefined;
}

/**
 * Dedicated Assistant Engine ensuring queries solely target candidate profile, resume ATS tailoring, and browser application readiness.
 */
export class AssistantEngine {
  constructor(private readonly provider: AIProvider = getAIProvider()) {}

  /**
   * Streams token responses from the assistant.
   */
  public async stream(options: AssistantPromptOptions): Promise<AsyncIterable<string>> {
    const combinedSystemPrompt = this.buildSystemPrompt(options.systemPrompt, options.context);
    return this.provider.streamText({
      prompt: options.prompt,
      systemPrompt: combinedSystemPrompt,
      ...(options.model ? { model: options.model } : {}),
    });
  }

  /**
   * Generates a complete text response from the assistant.
   */
  public async generate(options: AssistantPromptOptions): Promise<string> {
    const combinedSystemPrompt = this.buildSystemPrompt(options.systemPrompt, options.context);
    return this.provider.generateText({
      prompt: options.prompt,
      systemPrompt: combinedSystemPrompt,
      ...(options.model ? { model: options.model } : {}),
    });
  }

  private buildSystemPrompt(userSystemPrompt?: string, context?: AssistantContext): string {
    const sections: string[] = [ASSISTANT_SYSTEM_PROMPT];

    if (userSystemPrompt && userSystemPrompt.trim()) {
      sections.push(`USER DIRECTIVE FOR THIS INTERACTION:\n${userSystemPrompt.trim()}`);
    }

    if (context) {
      const contextLines: string[] = [];
      if (context.candidateName) contextLines.push(`Candidate: ${context.candidateName}`);
      if (context.candidateSummary) contextLines.push(`Current Profile Summary: ${context.candidateSummary}`);
      if (context.candidateSkills && context.candidateSkills.length > 0) {
        contextLines.push(`Core Skills: ${context.candidateSkills.join(", ")}`);
      }
      if (context.jobTitle || context.company) {
        contextLines.push(`Target Role: ${context.jobTitle || "Role"} at ${context.company || "Company"}`);
      }
      if (context.jobDescription) {
        contextLines.push(`Target Job Excerpt: ${context.jobDescription.slice(0, 1000)}`);
      }
      if (context.currentResumeSummary) {
        contextLines.push(`Current Tailored Resume Summary: ${context.currentResumeSummary}`);
      }

      if (contextLines.length > 0) {
        sections.push(`CURRENT CANDIDATE & APPLICATION CONTEXT:\n${contextLines.join("\n")}`);
      }
    }

    return sections.join("\n\n");
  }
}

let assistantEngineInstance: AssistantEngine | null = null;

export function getAssistantEngine(): AssistantEngine {
  if (!assistantEngineInstance) {
    assistantEngineInstance = new AssistantEngine();
  }
  return assistantEngineInstance;
}
