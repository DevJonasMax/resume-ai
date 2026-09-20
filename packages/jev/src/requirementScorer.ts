import type { SkillItem } from "@resume-ai/types";
import { score } from "@typesafe-ai/sdk";
import { JevClient } from "./client.js";

/**
 * Evaluates and scores requirement criticality using Jev System One scoring.
 */
export class RequirementScorer {
  private readonly jev: JevClient;

  constructor(jev?: JevClient) {
    this.jev = jev || new JevClient();
  }

  /**
   * Evaluates the criticality of a single skill requirement on an ordered 1-5 scale.
   */
  public async scoreCriticality(skillName: string, contextDescription: string): Promise<number> {
    const result = await this.jev.askScore(
      {
        skillName,
        jobContext: contextDescription.slice(0, 500),
      },
      score("How critical is this skill to candidate selection?", [
        null,
        "Nice-to-have or bonus mention",
        "Helpful secondary competence",
        "Standard expectation for this level",
        "Highly critical requirement",
        "Strict non-negotiable core competency",
      ] as const),
      4
    );

    return result.value;
  }

  /**
   * Refines an array of skill items by enriching them with calibrated criticality scores.
   */
  public async calibrateSkills(skills: SkillItem[], jobDescription: string): Promise<SkillItem[]> {
    const calibrated: SkillItem[] = [];

    for (const skill of skills) {
      const criticality = await this.scoreCriticality(skill.name, jobDescription);
      calibrated.push({
        ...skill,
        criticalityScore: criticality,
        required: criticality >= 4 || skill.required,
      });
    }

    return calibrated;
  }
}
