import express from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config";
import { v4 as uuidv4 } from "uuid";

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

router.get("/", async (req: any, res) => {
  try {
    const { exercises } = await import("../db/schema");
    const all = await db.select().from(exercises);
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const { exercises, questions, answers } = await import("../db/schema");
    const exercise = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, req.params.id))
      .limit(1);
    if (exercise.length === 0)
      return res.status(404).json({ error: "Exercise not found" });
    const questionRows = await db
      .select()
      .from(questions)
      .where(eq(questions.exerciseId, req.params.id));
    const fullQuestions = await Promise.all(
      questionRows.map(async (question) => ({
        ...question,
        answers: await db
          .select()
          .from(answers)
          .where(eq(answers.questionId, question.id)),
      })),
    );
    res.json({ ...exercise[0], questions: fullQuestions });
  } catch {
    res.status(500).json({ error: "Failed to fetch exercise" });
  }
});

router.post("/", async (req: any, res) => {
  try {
    const { exercises } = await import("../db/schema");
    const { title, type, difficulty } = req.body;
    const newEx = {
      id: uuidv4(),
      title,
      type: type || "TRẮC NGHIỆM",
      difficulty: difficulty || "MEDIUM",
      conceptId: null,
    };
    await db.insert(exercises).values(newEx);
    res.json(newEx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create" });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const { exercises } = await import("../db/schema");
    await db.delete(exercises).where(eq(exercises.id, req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

router.put("/:id", async (req: any, res) => {
  try {
    const { exercises } = await import("../db/schema");
    const { title } = req.body;
    await db
      .update(exercises)
      .set({ title })
      .where(eq(exercises.id, req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update" });
  }
});

export const exercisesRouter = router;
