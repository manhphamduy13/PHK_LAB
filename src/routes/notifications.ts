import express from 'express';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { notifications } from '../db/schema';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'phk-stem-lab-super-secret-key-2026';

import { authMiddleware, requireRole } from '../middleware/auth';
router.use(authMiddleware);

router.get('/', async (req: any, res) => {
  try {
    const userId = req.user.userId;
    // In production, add order by desc limit 50
    const myNotifications = await db.select().from(notifications).where(eq(notifications.userId, userId));
    res.json(myNotifications);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/read', async (req: any, res) => {
  try {
    const { id } = req.params;
    await db.update(notifications)
        .set({ readAt: new Date() })
        .where(eq(notifications.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export const notificationsRouter = router;
