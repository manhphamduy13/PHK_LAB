import express from "express";
import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  learnerProfiles,
  xpTransactions,
  progress,
  studentAchievements,
  studentAssignments,
} from "../db/schema";
import { GamificationEngine } from "../services/gamification/GamificationEngine";
import { v4 as uuidv4 } from "uuid";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();
router.use(authMiddleware);

// Helper to fetch/ensure student profile with full stats
async function getStudentProfileData(studentId: string) {
  let profile = await db
    .select()
    .from(learnerProfiles)
    .where(eq(learnerProfiles.studentId, studentId))
    .limit(1);

  if (profile.length === 0) {
    const newProfile = {
      id: uuidv4(),
      studentId,
      totalXp: 0,
      learningStreak: 1,
      lastActiveAt: new Date(),
      grade: 10,
    };
    await db.insert(learnerProfiles).values(newProfile);
    profile = [newProfile as any];
  }

  const currentProfile = profile[0];
  const xp = currentProfile.totalXp || 0;
  const streak = currentProfile.learningStreak || 0;
  const levelData = GamificationEngine.calculateLevel(xp);

  const recentActivity = await db
    .select()
    .from(xpTransactions)
    .where(eq(xpTransactions.studentId, studentId))
    .orderBy(desc(xpTransactions.timestamp))
    .limit(15);

  const completed = await db
    .select({ count: sql<number>`count(*)` })
    .from(progress)
    .where(
      and(
        eq(progress.userId, studentId),
        sql`LOWER(${progress.status}) = 'completed'`,
      ),
    );

  const badges = await db
    .select({ count: sql<number>`count(*)` })
    .from(studentAchievements)
    .where(eq(studentAchievements.studentId, studentId));

  // Compute accuracy rate from studentAssignments if available
  const gradedAssignments = await db
    .select({ score: studentAssignments.score })
    .from(studentAssignments)
    .where(
      and(
        eq(studentAssignments.studentId, studentId),
        eq(studentAssignments.status, "GRADED"),
      ),
    );

  let accuracyRate: number | null = null;
  if (gradedAssignments.length > 0) {
    const totalScore = gradedAssignments.reduce(
      (sum: number, a: any) => sum + (Number(a.score) || 0),
      0,
    );
    accuracyRate = Math.round(totalScore / gradedAssignments.length);
  }

  return {
    xp,
    streak,
    level: levelData.level,
    currentLevelXp: levelData.currentLevelXp,
    nextLevelXp: levelData.nextLevelXp,
    progress: levelData.progress,
    lessonsCompleted: Number(completed[0]?.count || 0),
    badgesCount: Number(badges[0]?.count || 0),
    accuracyRate,
    grade: currentProfile.grade || 10,
    recentActivity,
  };
}

// GET /api/gamification/profile
router.get("/profile", async (req: any, res) => {
  try {
    const studentId = req.user.userId;
    const data = await getStudentProfileData(studentId);
    res.json(data);
  } catch (err) {
    console.error("Gamification profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/gamification/award-xp
router.post("/award-xp", async (req: any, res) => {
  try {
    const studentId = req.user.userId;
    const { amount, action, sourceType, sourceId } = req.body;
    const numericAmount = Number(amount) || 0;

    if (numericAmount <= 0) {
      return res.status(400).json({ error: "Số XP phải lớn hơn 0" });
    }

    await GamificationEngine.awardXP(
      studentId,
      action || "LEARNING",
      sourceType || "GENERAL",
      sourceId || "",
      numericAmount,
    );

    const updatedProfile = await getStudentProfileData(studentId);
    res.json({
      success: true,
      awarded: numericAmount,
      ...updatedProfile,
    });
  } catch (err) {
    console.error("Award XP error:", err);
    res.status(500).json({ error: "Failed to award XP" });
  }
});

// POST /api/gamification/complete-lesson
router.post("/complete-lesson", async (req: any, res) => {
  try {
    const studentId = req.user.userId;
    const { lessonId } = req.body;

    if (!lessonId) {
      return res.status(400).json({ error: "lessonId is required" });
    }

    // Check if already in progress table
    const existing = await db
      .select()
      .from(progress)
      .where(
        and(eq(progress.userId, studentId), eq(progress.lessonId, lessonId)),
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(progress)
        .set({ status: "completed" })
        .where(eq(progress.id, existing[0].id));
    } else {
      await db.insert(progress).values({
        id: uuidv4(),
        userId: studentId,
        lessonId,
        status: "completed",
      });
    }

    // Award 50 XP for lesson completion (anti-abuse checks sourceId)
    await GamificationEngine.awardXP(
      studentId,
      "COMPLETE_LESSON",
      "LESSON",
      lessonId,
      50,
    );

    const updatedProfile = await getStudentProfileData(studentId);
    res.json({
      success: true,
      lessonId,
      ...updatedProfile,
    });
  } catch (err) {
    console.error("Complete lesson error:", err);
    res.status(500).json({ error: "Failed to complete lesson" });
  }
});

export const gamificationRouter = router;
