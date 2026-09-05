import { db } from '../../db';
import { conceptMastery, recommendations, lessons, progress, flashcards, flashcardReviews, exercises, questions, answers } from '../../db/schema';
import { eq, and, desc, inArray, lt } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export class RecommendationService {
  static async generateRecommendations(studentId: string) {
    // 1. Get concept mastery
    const masteries = await db.select().from(conceptMastery).where(eq(conceptMastery.studentId, studentId));
    
    // Clear old pending recommendations
    await db.delete(recommendations).where(eq(recommendations.studentId, studentId));
    const recs: any[] = [];
    
    // Priority logic
    const weakConcepts = masteries.filter(m => m.masteryScore < 60);
    const developingConcepts = masteries.filter(m => m.masteryScore >= 60 && m.masteryScore < 80);
    
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

    // 2. Fetch in-progress lesson or next lesson
    const studentProgress = await db.select()
      .from(progress)
      .where(and(eq(progress.userId, studentId), eq(progress.status, 'in_progress')))
      .orderBy(desc(progress.updatedAt))
      .limit(1);

    let nextLessonId = null;
    let lessonReason = 'Bài học tiếp theo trong lộ trình của bạn.';

    if (studentProgress.length > 0) {
      nextLessonId = studentProgress[0].lessonId;
      lessonReason = 'Tiếp tục bài học bạn đang học dở.';
    } else {
      const completed = await db.select().from(progress).where(and(eq(progress.userId, studentId), eq(progress.status, 'completed')));
      const completedIds = completed.map(c => c.lessonId);
      
      const allLessons = await db.select().from(lessons).orderBy(lessons.order);
      const uncompletedLessons = allLessons.filter(l => !completedIds.includes(l.id));
      
      if (uncompletedLessons.length > 0) {
        nextLessonId = uncompletedLessons[0].id;
      }
    }

    if (nextLessonId) {
      recs.push({
         id: uuidv4(),
         studentId,
         type: 'LESSON',
         resourceId: nextLessonId,
         reason: lessonReason,
         createdAt: new Date()
      });
    }

    // 3. Flashcards (Spaced Repetition)
    // Find due flashcards
    const now = new Date();
    const reviews = await db.select().from(flashcardReviews)
      .where(and(
        eq(flashcardReviews.studentId, studentId),
        lt(flashcardReviews.dueDate, now)
      ));
    
    if (reviews.length > 0) {
       recs.push({
         id: uuidv4(),
         studentId,
         type: 'FLASHCARD_DECK',
         resourceId: 'due_reviews',
         reason: `Bạn có ${reviews.length} thẻ ghi nhớ cần ôn tập (Spaced Repetition).`,
         createdAt: new Date()
       });
    } else if (weakConcepts.length > 0) {
       // Recommend flashcards for weak concepts
       const weakIds = weakConcepts.map(c => c.conceptId);
       const cards = await db.select().from(flashcards).where(inArray(flashcards.conceptId, weakIds)).limit(5);
       if (cards.length > 0) {
         recs.push({
           id: uuidv4(),
           studentId,
           type: 'FLASHCARD_DECK',
           resourceId: 'weak_concepts',
           reason: 'Ôn tập thẻ ghi nhớ cho các khái niệm bạn đang yếu.',
           createdAt: new Date()
         });
       }
    }

    // 4. Exercises
    // Recommend exercises based on current lesson or weak concepts
    let targetLessonIdForExercise = nextLessonId;
    if (weakConcepts.length > 0 && Math.random() > 0.5) {
       // Find lesson for weak concept (approximated, ideally we have concept-lesson map)
       // We'll just suggest an exercise if one exists
       const allEx = await db.select().from(exercises).limit(5);
       if (allEx.length > 0) {
         recs.push({
           id: uuidv4(),
           studentId,
           type: 'EXERCISE',
           resourceId: allEx[0].id,
           reason: 'Luyện tập thêm để cải thiện kỹ năng.',
           createdAt: new Date()
         });
       }
    } else if (targetLessonIdForExercise) {
       const exs = await db.select().from(exercises).where(eq(exercises.lessonId, targetLessonIdForExercise));
       if (exs.length > 0) {
         recs.push({
           id: uuidv4(),
           studentId,
           type: 'EXERCISE',
           resourceId: exs[0].id,
           reason: 'Bài tập áp dụng cho bài học hiện tại.',
           createdAt: new Date()
         });
       }
    }

    if (recs.length > 0) {
      await db.insert(recommendations).values(recs);
    }
  }

  static async getActiveRecommendations(studentId: string) {
    await this.generateRecommendations(studentId);
    return await db.select().from(recommendations).where(eq(recommendations.studentId, studentId));
  }

  static async getFlashcardsForReview(studentId: string) {
    // True Spaced Repetition logic + Weak concepts priority
    const now = new Date();
    
    // 1. Get due cards
    const dueReviews = await db.select().from(flashcardReviews)
      .where(and(
        eq(flashcardReviews.studentId, studentId),
        lt(flashcardReviews.dueDate, now)
      ));
      
    let dueCardIds = dueReviews.map(r => r.flashcardId);
    
    // 2. If not enough due cards, get cards for weak concepts
    if (dueCardIds.length < 10) {
       const masteries = await db.select().from(conceptMastery).where(eq(conceptMastery.studentId, studentId));
       const weakConcepts = masteries.filter(m => m.masteryScore < 70).map(m => m.conceptId);
       
       if (weakConcepts.length > 0) {
         const extraCards = await db.select().from(flashcards).where(inArray(flashcards.conceptId, weakConcepts));
         const extraIds = extraCards.map(c => c.id).filter(id => !dueCardIds.includes(id));
         dueCardIds = [...dueCardIds, ...extraIds.slice(0, 10 - dueCardIds.length)];
       }
    }
    
    // 3. Fallback to random if still empty
    if (dueCardIds.length === 0) {
      const allCards = await db.select().from(flashcards).limit(10);
      dueCardIds = allCards.map(c => c.id);
    }

    if (dueCardIds.length === 0) return [];

    return await db.select().from(flashcards).where(inArray(flashcards.id, dueCardIds));
  }
  
  static async getExerciseRecommendation(studentId: string) {
    // 1. Try weak concepts
    const masteries = await db.select().from(conceptMastery).where(eq(conceptMastery.studentId, studentId));
    const weakConcepts = masteries.filter(m => m.masteryScore < 70).map(m => m.conceptId);
    
    if (weakConcepts.length > 0) {
       // Since exercises don't directly map to concepts in current schema, 
       // we might need to map via lessons. For now, we will pick an exercise.
       // We can just pick the first available for simplicity or try to match.
    }
    
    // 2. Try current lesson
    const studentProgress = await db.select()
      .from(progress)
      .where(and(eq(progress.userId, studentId), eq(progress.status, 'in_progress')))
      .orderBy(desc(progress.updatedAt))
      .limit(1);

    if (studentProgress.length > 0) {
       const lessonId = studentProgress[0].lessonId;
       const lessonExercises = await db.select().from(exercises).where(eq(exercises.lessonId, lessonId));
       if (lessonExercises.length > 0) return lessonExercises[0];
    }
    
    // 3. Fallback to any exercise
    const all = await db.select().from(exercises).limit(1);
    return all.length > 0 ? all[0] : null;
  }
}
