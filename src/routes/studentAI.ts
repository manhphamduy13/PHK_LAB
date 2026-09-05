import express from "express";
import { aiProvider } from "../services/ai/GeminiProvider";
import { AITaskType } from "../services/ai/ModelRouter";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config";

const router = express.Router();
const JWT_SECRET = getJwtSecret();

const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  try {
    const decoded: any = jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    req.user = decoded; // Anyone can chat
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

router.use(authMiddleware);

router.post("/chat", async (req: any, res) => {
  try {
    const { message, context } = req.body;
    let prompt = message;
    if (context) {
      prompt = `Context: ${context}\n\nUser Question: ${message}`;
    }
    
    // FAST_MODEL is mapped to NORMAL_TASK
    const responseText = await aiProvider.generateText(
      prompt,
      AITaskType.NORMAL_TASK,
      "You are a helpful and patient physics tutor. Answer the student's questions simply and accurately."
    );
    
    res.json({ reply: responseText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Tutor AI failed" });
  }
});

router.post("/hint", async (req: any, res) => {
  try {
    const { concept } = req.body;
    const responseText = await aiProvider.generateText(
      `Hãy đưa ra gợi ý ngắn gọn để hiểu về khái niệm: ${concept}`,
      AITaskType.NORMAL_TASK,
      "You are a helpful physics tutor. Provide a short, guiding hint without giving away the full answer immediately."
    );
    res.json({ hint: responseText });
  } catch (err) {
    res.status(500).json({ error: "Tutor AI failed" });
  }
});

router.post("/simplify", async (req: any, res) => {
  try {
    const { text } = req.body;
    const responseText = await aiProvider.generateText(
      `Hãy giải thích thật đơn giản và dễ hiểu cho một học sinh phổ thông về đoạn sau: ${text}`,
      AITaskType.NORMAL_TASK,
      "You are a helpful physics tutor."
    );
    res.json({ simplified: responseText });
  } catch (err) {
    res.status(500).json({ error: "Tutor AI failed" });
  }
});

export const studentAIRouter = router;
