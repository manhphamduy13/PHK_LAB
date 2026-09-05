import { db } from '../../db';
import { learningEvents } from '../../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { GamificationEngine } from '../gamification/GamificationEngine';

export type EventType = 
  | 'lesson_started' 
  | 'lesson_completed' 
  | 'quiz_started'
  | 'question_answered'
  | 'simulation_started'
  | 'simulation_completed'
  | 'measurement_taken'
  | 'ai_tutor_question'
  | 'ai_tutor_feedback';

export class EventTrackingService {
  static async track(
    studentId: string, 
    eventType: EventType, 
    resourceId?: string, 
    conceptId?: string, 
    metadata?: any
  ) {
    try {
      const eventId = uuidv4();
      await db.insert(learningEvents).values({
        id: eventId,
        studentId,
        eventType,
        resourceId,
        conceptId,
        metadata: metadata ? JSON.stringify(metadata) : null,
        timestamp: new Date(),
      });

      // trigger Gamification
      if (eventType === 'lesson_completed') {
        GamificationEngine.awardXP(studentId, 'LESSON_COMPLETED', 'LESSON', resourceId || '', 100).catch(console.error);
      } else if (eventType === 'simulation_completed') {
        GamificationEngine.awardXP(studentId, 'SIMULATION_COMPLETED', 'SIMULATION', resourceId || '', 150).catch(console.error);
      }

      // trigger Mastery update asynchronously based on the event
      if (['question_answered', 'simulation_completed'].includes(eventType)) {
         this.triggerMasteryCalculation(studentId, conceptId, eventType, metadata).catch(console.error);
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  static async triggerMasteryCalculation(studentId: string, conceptId: string | undefined, eventType: string, metadata: any) {
    if (!conceptId) return;
    
    const { MasteryService } = await import('./MasteryService');
    
    if (eventType === 'question_answered') {
      const isCorrect = metadata?.isCorrect;
      const difficulty = metadata?.difficulty || 'medium';
      await MasteryService.updateMastery(studentId, conceptId, isCorrect, difficulty);

      // Award XP for correct answer
      if (isCorrect) {
         GamificationEngine.awardXP(studentId, 'QUESTION_CORRECT', 'QUESTION', metadata?.questionId || uuidv4(), 10).catch(console.error);
      }
    } else if (eventType === 'simulation_completed') {
      await MasteryService.updateMastery(studentId, conceptId, true, 'medium', 0.5);
    }
  }
}
