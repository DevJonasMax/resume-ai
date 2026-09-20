import { appConfig } from "@resume-ai/config";
import {
  type ChoiceCriteria,
  type ChoiceQuestion,
  type EntryType,
  type NoulQuestion,
  type ScoreCriteria,
  type ScoreQuestion,
  TypeSafeClient,
} from "@typesafe-ai/sdk";

/**
 * Result structure returned by Jev decision calls.
 */
export interface JevDecisionResult<T> {
  value: T;
  confidence: number;
  explanation: string;
}

/**
 * Client wrapper for TypeSafe AI System One decision engine.
 */
export class JevClient {
  private readonly client: TypeSafeClient | null = null;

  constructor() {
    if (appConfig.typesafeApiKey) {
      this.client = new TypeSafeClient({ apiKey: appConfig.typesafeApiKey });
    }
  }

  /**
   * Evaluates a typed Choice question using Jev System One or deterministic fallback.
   */
  public async askChoice<const C extends ChoiceCriteria>(
    state: EntryType,
    question: ChoiceQuestion<C>,
    fallbackSelector?: () => { value: keyof C & string; confidence: number; explanation: string }
  ): Promise<JevDecisionResult<keyof C & string>> {
    if (this.client) {
      try {
        const response = await this.client.systemOne({
          state,
          questions: {
            decision: question,
          },
        });
        const answer = response.answers.decision;
        return {
          value: answer.choice,
          confidence: answer.confidence ?? 0.9,
          explanation: `Jev selected ${answer.choice} with confidence ${answer.confidence ?? 0.9}`,
        };
      } catch {
        // Fallback gracefully on network or API issues
      }
    }

    if (fallbackSelector) {
      return fallbackSelector();
    }

    const firstOption = Object.keys(question.criteria)[0] as keyof C & string;
    return {
      value: firstOption,
      confidence: 0.85,
      explanation: `Selected ${firstOption} via deterministic rule`,
    };
  }

  /**
   * Evaluates a Score question on an ordered scale (e.g. 1-5).
   */
  public async askScore<const S extends ScoreCriteria>(
    state: EntryType,
    question: ScoreQuestion<S>,
    fallbackScore = 3
  ): Promise<JevDecisionResult<number>> {
    if (this.client) {
      try {
        const response = await this.client.systemOne({
          state,
          questions: {
            rating: question,
          },
        });
        const answer = response.answers.rating;
        return {
          value: answer.score,
          confidence: answer.confidence ?? 0.9,
          explanation: `Jev scored ${answer.score}`,
        };
      } catch {
        // Fallback gracefully on network or API issues
      }
    }

    return {
      value: fallbackScore,
      confidence: 0.8,
      explanation: `Scored ${fallbackScore} via default assessment`,
    };
  }

  /**
   * Evaluates a binary Noul question (probability of yes).
   */
  public async askNoul(
    state: EntryType,
    question: NoulQuestion,
    fallbackYes = true
  ): Promise<JevDecisionResult<boolean>> {
    if (this.client) {
      try {
        const response = await this.client.systemOne({
          state,
          questions: {
            check: question,
          },
        });
        const answer = response.answers.check;
        const isYes = answer.noul >= 0.5;
        return {
          value: isYes,
          confidence: 0.9,
          explanation: `Probability: ${answer.noul.toFixed(2)}`,
        };
      } catch {
        // Fallback gracefully on network or API issues
      }
    }

    return {
      value: fallbackYes,
      confidence: 0.85,
      explanation: "Evaluated via fallback rule",
    };
  }
}
