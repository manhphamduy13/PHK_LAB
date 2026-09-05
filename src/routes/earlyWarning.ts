import express from 'express';
import { db } from '../db';
import { eq, sql } from 'drizzle-orm';
import { earlyWarningSignals, learnerProfiles, conceptMastery, users } from '../db/schema';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'phk-stem-lab-super-secret-key-2026';

import { authMiddleware, requireRole } from '../middleware/auth';
router.use(authMiddleware);
router.use(requireRole(['TEACHER', 'SUPER_ADMIN']));

router.get('/signals', async (req: any, res) => {
  try {
    // Generate signals on the fly for demo, or read from DB
    // Simple deterministic risk logic
    const profiles = await db.select().from(learnerProfiles);
    const signals = [];
    
    for (const p of profiles) {
       const masteries = await db.select().from(conceptMastery).where(eq(conceptMastery.studentId, p.studentId));
       const weak = masteries.filter(m => m.masteryScore < 50);
       
       let riskScore = 0;
       const reasons = [];
       
       if (weak.length > 2) {
           riskScore += 40;
           reasons.push(`Nhiều khái niệm yếu (${weak.length})`);
       }
       if (p.lastActiveAt && (Date.now() - p.lastActiveAt.getTime()) > 7 * 24 * 60 * 60 * 1000) {
           riskScore += 30;
           reasons.push(`Không hoạt động hơn 7 ngày`);
       }
       
       if (riskScore > 0) {
           let riskLevel = 'LOW';
           if (riskScore > 60) riskLevel = 'HIGH';
           else if (riskScore > 30) riskLevel = 'MEDIUM';
           
           // fetch student name
           const studentArr = await db.select().from(users).where(eq(users.id, p.studentId));
           
           signals.push({
               studentId: p.studentId,
               studentName: studentArr.length > 0 ? studentArr[0].name : 'Unknown',
               riskScore,
               riskLevel,
               reasons,
               suggestedAction: 'Giao bài ôn tập'
           });
       }
    }

    res.json({ signals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch early warnings' });
  }
});

export const earlyWarningRouter = router;
