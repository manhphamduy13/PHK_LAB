import express from "express";
import { db } from "../db";
import { answers, questions } from "../db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = express.Router();
router.use(authMiddleware, requireRole(["TEACHER", "SUPER_ADMIN"]));

router.get("/", async (_req, res) => {
  try {
    const rows = await db.select().from(questions);
    const result = await Promise.all(
      rows.map(async (question) => ({
        ...question,
        answers: await db
          .select()
          .from(answers)
          .where(eq(answers.questionId, question.id)),
      })),
    );
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { exerciseId, content, type, answerOptions = [] } = req.body;
    if (!exerciseId || !content)
      return res
        .status(400)
        .json({ error: "exerciseId and content are required" });
    const question = {
      id: uuidv4(),
      exerciseId,
      content,
      type: type || "multiple_choice",
    };
    await db.insert(questions).values(question);
    for (const option of answerOptions)
      await db
        .insert(answers)
        .values({
          id: uuidv4(),
          questionId: question.id,
          content: option.content,
          isCorrect: Boolean(option.isCorrect),
        });
    res.json(question);
  } catch {
    res.status(500).json({ error: "Failed to create question" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    await db
      .update(questions)
      .set({ content: req.body.content, type: req.body.type })
      .where(eq(questions.id, req.params.id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update question" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(answers).where(eq(answers.questionId, req.params.id));
    await db.delete(questions).where(eq(questions.id, req.params.id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete question" });
  }
});

export const questionsRouter = router;
