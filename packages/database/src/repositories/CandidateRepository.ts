import type { CandidateProfile } from "@resume-ai/types";
import { desc, eq } from "drizzle-orm";
import { type AppDatabase, getDb } from "../db.js";
import { candidateProfilesTable } from "../schema.js";

/**
 * Repository providing access to verified candidate career profiles.
 */
export class CandidateRepository {
  private readonly db: AppDatabase;

  constructor(db?: AppDatabase) {
    this.db = db || getDb();
  }

  private mapRecord(record: typeof candidateProfilesTable.$inferSelect): CandidateProfile {
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
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  public async getAllProfiles(): Promise<CandidateProfile[]> {
    const records = this.db
      .select()
      .from(candidateProfilesTable)
      .orderBy(desc(candidateProfilesTable.updatedAt))
      .all();

    return records.map((r) => this.mapRecord(r));
  }

  public async getActiveProfile(): Promise<CandidateProfile | null> {
    const active = this.db
      .select()
      .from(candidateProfilesTable)
      .where(eq(candidateProfilesTable.isActive, true))
      .limit(1)
      .get();

    if (active) return this.mapRecord(active);

    const fallback = this.db
      .select()
      .from(candidateProfilesTable)
      .orderBy(desc(candidateProfilesTable.updatedAt))
      .limit(1)
      .get();

    return fallback ? this.mapRecord(fallback) : null;
  }

  public async getProfileById(id: string): Promise<CandidateProfile | null> {
    const record = this.db
      .select()
      .from(candidateProfilesTable)
      .where(eq(candidateProfilesTable.id, id))
      .limit(1)
      .get();

    return record ? this.mapRecord(record) : null;
  }

  public async setActiveProfile(id: string): Promise<CandidateProfile | null> {
    this.db
      .update(candidateProfilesTable)
      .set({ isActive: false })
      .run();

    this.db
      .update(candidateProfilesTable)
      .set({ isActive: true, updatedAt: new Date().toISOString() })
      .where(eq(candidateProfilesTable.id, id))
      .run();

    return this.getProfileById(id);
  }

  public async deleteProfile(id: string): Promise<void> {
    this.db
      .delete(candidateProfilesTable)
      .where(eq(candidateProfilesTable.id, id))
      .run();
  }

  public async save(profile: CandidateProfile): Promise<CandidateProfile> {
    const existing = this.db
      .select()
      .from(candidateProfilesTable)
      .where(eq(candidateProfilesTable.id, profile.id))
      .get();

    const isActive = profile.isActive ?? false;

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
          isActive,
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
          isActive,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        })
        .run();
    }
    return profile;
  }
}
