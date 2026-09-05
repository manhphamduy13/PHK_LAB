import { db } from '../../db';
import { conceptMastery, learnerProfiles } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export class MasteryService {
  /**
   * Update a concept's mastery score.
   * Uses an Elo-like deterministic algorithm.
   */
  static async updateMastery(
    studentId: string, 
    conceptId: string, 
    isSuccess: boolean, 
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    impactMultiplier: number = 1.0
  ) {
    // Determine point change
    let change = 0;
    if (isSuccess) {
      change = difficulty === 'hard' ? 15 : difficulty === 'medium' ? 10 : 5;
    } else {
      change = difficulty === 'hard' ? -2 : difficulty === 'medium' ? -5 : -10;
    }
    
    change *= impactMultiplier;

    // Fetch existing
    let records = await db.select().from(conceptMastery).where(
      and(eq(conceptMastery.studentId, studentId), eq(conceptMastery.conceptId, conceptId))
    );

    let currentScore = 0;
    let isNew = false;
    let recordId = '';

    if (records.length === 0) {
      isNew = true;
      recordId = uuidv4();
    } else {
      currentScore = records[0].masteryScore;
      recordId = records[0].id;
    }

    let newScore = Math.min(100, Math.max(0, currentScore + change));
    let newStatus = this.determineStatus(newScore);

    if (isNew) {
      await db.insert(conceptMastery).values({
        id: recordId,
        studentId,
        conceptId,
        masteryScore: Math.round(newScore),
        status: newStatus,
        updatedAt: new Date(),
      });
    } else {
      await db.update(conceptMastery)
        .set({ masteryScore: Math.round(newScore), status: newStatus, updatedAt: new Date() })
        .where(eq(conceptMastery.id, recordId));
    }

    // After updating concept, aggregate profiles
    await this.syncLearnerProfile(studentId);
  }

  static determineStatus(score: number): string {
    if (score >= 85) return 'MASTERED';
    if (score >= 60) return 'DEVELOPING';
    if (score >= 30) return 'LEARNING';
    if (score > 0) return 'WEAK';
    return 'NOT_STARTED';
  }

  static async syncLearnerProfile(studentId: string) {
    const allMasteries = await db.select().from(conceptMastery).where(eq(conceptMastery.studentId, studentId));
    
    const weak = allMasteries.filter(m => m.masteryScore < 50).map(m => m.conceptId);
    const strong = allMasteries.filter(m => m.masteryScore >= 80).map(m => m.conceptId);

    const profile = await db.select().from(learnerProfiles).where(eq(learnerProfiles.studentId, studentId));
    if (profile.length === 0) {
      await db.insert(learnerProfiles).values({
        studentId,
        weakConcepts: JSON.stringify(weak),
        strongConcepts: JSON.stringify(strong),
        totalXp: 10, // Just a starting XP
        lastActiveAt: new Date()
      });
    } else {
      await db.update(learnerProfiles).set({
        weakConcepts: JSON.stringify(weak),
        strongConcepts: JSON.stringify(strong),
        lastActiveAt: new Date()
      }).where(eq(learnerProfiles.studentId, studentId));
    }
  }
}
