import express from 'express';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { learnerProfiles, xpTransactions } from '../db/schema';
import jwt from 'jsonwebtoken';
import { GamificationEngine } from '../services/gamification/GamificationEngine';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'phk-stem-lab-super-secret-key-2026';

import { authMiddleware, requireRole } from '../middleware/auth';
router.use(authMiddleware);

router.get('/profile', async (req: any, res) => {
  try {
    const studentId = req.user.userId;
    const profile = await db.select().from(learnerProfiles).where(eq(learnerProfiles.studentId, studentId));
    
    if (profile.length === 0) {
        return res.status(404).json({ error: 'Profile not found' });
    }

    const xp = profile[0].totalXp || 0;
    const streak = profile[0].learningStreak || 0;
    const levelData = GamificationEngine.calculateLevel(xp);
    
    const recentActivity = await db.select()
        .from(xpTransactions)
        .where(eq(xpTransactions.studentId, studentId))
        .orderBy(xpTransactions.timestamp)
        .limit(10); // in prod, order by desc (currently missing sort order, assume it's just raw)

    res.json({
        xp,
        streak,
        level: levelData.level,
        currentLevelXp: levelData.currentLevelXp,
        nextLevelXp: levelData.nextLevelXp,
        progress: levelData.progress,
        recentActivity
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export const gamificationRouter = router;
