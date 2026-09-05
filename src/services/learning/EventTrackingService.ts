import { db } from '../../db';
import { learningEvents } from '../../db/schema';
import { v4 as uuidv4 } from 'uuid';

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
      await db.insert(learningEvents).values({
        id: uuidv4(),
        studentId,
        eventType,
        resourceId,
        conceptId,
        metadata: metadata ? JSON.stringify(metadata) : null,
        timestamp: new Date(),
      });
      // Optionally trigger Mastery update asynchronously based on the event
      if (['question_answered', 'simulation_completed'].includes(eventType)) {
         // Fire and forget mastery calculation
         this.triggerMasteryCalculation(studentId, conceptId, eventType, metadata).catch(console.error);
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  static async triggerMasteryCalculation(studentId: string, conceptId: string | undefined, eventType: string, metadata: any) {
    if (!conceptId) return;
    
    // We import MasteryService dynamically to avoid circular dependencies if any
    const { MasteryService } = await import('./MasteryService');
    
    if (eventType === 'question_answered') {
      const isCorrect = metadata?.isCorrect;
      const difficulty = metadata?.difficulty || 'medium';
      await MasteryService.updateMastery(studentId, conceptId, isCorrect, difficulty);
    } else if (eventType === 'simulation_completed') {
      // Reward completion
      await MasteryService.updateMastery(studentId, conceptId, true, 'medium', 0.5); // lower impact than a quiz
    }
  }
}
