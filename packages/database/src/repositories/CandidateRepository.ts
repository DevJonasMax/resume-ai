import type { CandidateProfile } from "@resume-ai/types";
import { eq } from "drizzle-orm";
import { type AppDatabase, getDb } from "../db.js";
import { candidateProfilesTable } from "../schema.js";

/**
 * Repository providing access to the verified candidate career profile.
 */
export class CandidateRepository {
  private readonly db: AppDatabase;

  constructor(db?: AppDatabase) {
    this.db = db || getDb();
  }

  public async getActiveProfile(): Promise<CandidateProfile | null> {
    const record = this.db.select().from(candidateProfilesTable).limit(1).get();
    if (!record) return null;

    return {
      id: record.id,
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      location: record.location,
      summary: record.summary,
      experiences: JSON.parse(record.experiencesJson),
      skills: JSON.parse(record.skillsJson),
      education: JSON.parse(record.educationJson),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  public async save(profile: CandidateProfile): Promise<CandidateProfile> {
    const existing = this.db
      .select()
      .from(candidateProfilesTable)
      .where(eq(candidateProfilesTable.id, profile.id))
      .get();

    if (existing) {
      this.db
        .update(candidateProfilesTable)
        .set({
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          summary: profile.summary,
          experiencesJson: JSON.stringify(profile.experiences),
          skillsJson: JSON.stringify(profile.skills),
          educationJson: JSON.stringify(profile.education),
          updatedAt: profile.updatedAt,
        })
        .where(eq(candidateProfilesTable.id, profile.id))
        .run();
    } else {
      this.db
        .insert(candidateProfilesTable)
        .values({
          id: profile.id,
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          summary: profile.summary,
          experiencesJson: JSON.stringify(profile.experiences),
          skillsJson: JSON.stringify(profile.skills),
          educationJson: JSON.stringify(profile.education),
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        })
        .run();
    }
    return profile;
  }
}
