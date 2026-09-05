import express from "express";
import { db } from "../db";
import { eq, sql } from "drizzle-orm";
import { examPlans, conceptMastery, progress } from "../db/schema";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { GeminiProvider } from "../services/ai/GeminiProvider";
import { AITaskType } from "../services/ai/ModelRouter";
import { getJwtSecret } from "../config";

const router = express.Router();
const JWT_SECRET = getJwtSecret();

const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  try {
    const decoded: any = jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

router.use(authMiddleware);

router.post("/plan", async (req: any, res) => {
  try {
    const { examDate, subject, targetScore } = req.body;
    const studentId = req.user.userId;

    const masteries = await db
      .select()
      .from(conceptMastery)
      .where(eq(conceptMastery.studentId, studentId));

    let readinessScore = 0;
    if (masteries.length > 0) {
      readinessScore =
        masteries.reduce((acc, m) => acc + m.masteryScore, 0) /
        masteries.length;
    } else {
      readinessScore = 50;
    }

    const plan = {
      id: uuidv4(),
      studentId,
      examDate: new Date(examDate),
      subject,
      targetScore,
      readinessScore: Math.round(readinessScore),
      createdAt: new Date(),
    };

    await db.insert(examPlans).values(plan);

    // AI Generate Study Plan Breakdown
    const aiProvider = new GeminiProvider();
    const systemPrompt = `Tạo kế hoạch ôn thi môn ${subject}. Học sinh có điểm readiness: ${Math.round(readinessScore)}. Ngày thi: ${examDate}.
Trả về mảng JSON các topics ưu tiên ôn tập.`;
    const response: any = await aiProvider.generateStructuredOutput(
      "Lên kế hoạch",
      {
        type: "OBJECT",
        properties: {
          topics: { type: "ARRAY", items: { type: "STRING" } },
          schedule: { type: "STRING" },
        },
        required: ["topics", "schedule"],
      },
      AITaskType.COMPLEX_REASONING,
      systemPrompt,
    );

    res.json({ plan, breakdown: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Exam Prep failed" });
  }
});

export const examPrepRouter = router;
