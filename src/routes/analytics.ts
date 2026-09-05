import express from "express";
import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import {
  enrollments,
  conceptMastery,
  learningEvents,
  classes,
} from "../db/schema";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config";

const router = express.Router();
const JWT_SECRET = getJwtSecret();

import { authMiddleware, requireRole } from "../middleware/auth";
router.use(authMiddleware);

// Get Concept Heatmap for a Class
router.get("/class/:classId/heatmap", async (req: any, res) => {
  try {
    if (req.user.role !== "TEACHER" && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { classId } = req.params;
    if (req.user.role === "TEACHER") {
      const ownedClass = await db
        .select()
        .from(classes)
        .where(
          and(eq(classes.id, classId), eq(classes.teacherId, req.user.userId)),
        )
        .limit(1);
      if (ownedClass.length === 0)
        return res.status(403).json({ error: "Forbidden" });
    }

    // 1. Get students in class
    const studentsInClass = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.classId, classId));
    const studentIds = studentsInClass.map((s) => s.studentId);

    if (studentIds.length === 0) {
      return res.json({ heatmap: [] });
    }

    // 2. Fetch masteries for these students
    // SQLite doesn't natively support easy inArray in drizzle if array is empty, but we guarded it.
    // We will fetch all and filter for now to avoid complex queries in this simple DB.
    const allMasteries = await db.select().from(conceptMastery);
    const classMasteries = allMasteries.filter((m) =>
      studentIds.includes(m.studentId),
    );

    // 3. Aggregate
    const conceptMap: Record<string, { totalScore: number; count: number }> =
      {};
    for (const m of classMasteries) {
      if (!conceptMap[m.conceptId]) {
        conceptMap[m.conceptId] = { totalScore: 0, count: 0 };
      }
      conceptMap[m.conceptId].totalScore += m.masteryScore;
      conceptMap[m.conceptId].count += 1;
    }

    const heatmap = Object.keys(conceptMap).map((conceptId) => ({
      conceptId,
      averageMastery: Math.round(
        conceptMap[conceptId].totalScore / conceptMap[conceptId].count,
      ),
      studentCount: conceptMap[conceptId].count,
    }));

    res.json({ heatmap });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export const analyticsRouter = router;
