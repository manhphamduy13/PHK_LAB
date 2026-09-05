import { db } from '../../db';
import { conceptMastery, recommendations, lessons, courses } from '../../db/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export class RecommendationService {
  static async generateRecommendations(studentId: string) {
    // 1. Get weak concepts
    const masteries = await db.select().from(conceptMastery).where(eq(conceptMastery.studentId, studentId));
    const weakConcepts = masteries.filter(m => m.masteryScore < 60 && m.masteryScore > 0);
    
    // Clear old pending recommendations
    await db.delete(recommendations).where(eq(recommendations.studentId, studentId));

    const recs: any[] = [];
    
    // Suggest review for weak concepts
    for (const weak of weakConcepts.slice(0, 2)) {
       recs.push({
         id: uuidv4(),
         studentId,
         type: 'REVIEW',
         resourceId: weak.conceptId,
         reason: `Bạn cần ôn tập lại khái niệm này vì điểm thông thạo đang ở mức ${weak.masteryScore}%`,
         createdAt: new Date()
       });
    }

    // Suggest continuing recent lesson (mock logic for now, just fetch random lessons or the first one)
    const allLessons = await db.select().from(lessons).limit(3);
    if (allLessons.length > 0) {
      recs.push({
         id: uuidv4(),
         studentId,
         type: 'LESSON',
         resourceId: allLessons[0].id,
         reason: 'Bài học tiếp theo trong lộ trình của bạn.',
         createdAt: new Date()
      });
    }

    if (recs.length > 0) {
      await db.insert(recommendations).values(recs);
    }
  }

  static async getActiveRecommendations(studentId: string) {
    // Regenerate daily or based on trigger
    await this.generateRecommendations(studentId);
    return await db.select().from(recommendations).where(eq(recommendations.studentId, studentId));
  }
}
