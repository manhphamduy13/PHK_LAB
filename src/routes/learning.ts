import express from 'express';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { EventTrackingService } from '../services/learning/EventTrackingService';
import { RecommendationService } from '../services/learning/RecommendationService';
import { TutorService } from '../services/learning/TutorService';
import { conceptMastery, learnerProfiles } from '../db/schema';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'phk-stem-lab-super-secret-key-2026';

// Middleware to extract studentId from token
const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  try {
    const decoded: any = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.use(authMiddleware);

// 1. Event Tracking
router.post('/track', async (req: any, res) => {
  try {
    const { eventType, resourceId, conceptId, metadata } = req.body;
    await EventTrackingService.track(req.user.userId, eventType, resourceId, conceptId, metadata);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// 2. Get Profile & Mastery
router.get('/profile', async (req: any, res) => {
  try {
    const studentId = req.user.userId;
    const profile = await db.select().from(learnerProfiles).where(eq(learnerProfiles.studentId, studentId));
    const masteries = await db.select().from(conceptMastery).where(eq(conceptMastery.studentId, studentId));
    
    res.json({
      profile: profile.length > 0 ? profile[0] : null,
      mastery: masteries
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// 3. Get Recommendations
router.get('/recommendations', async (req: any, res) => {
  try {
    const recs = await RecommendationService.getActiveRecommendations(req.user.userId);
    res.json({ recommendations: recs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// 4. Khê AI Tutor Chat
router.post('/tutor/chat', async (req: any, res) => {
  try {
    const { message, lessonId, context } = req.body;
    const response = await TutorService.handleStudentMessage(req.user.userId, lessonId, message, context);
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI Tutor failed' });
  }
});

router.get('/tutor/history', async (req: any, res) => {
  try {
    const history = await TutorService.getConversation(req.user.userId);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export const learningRouter = router;
