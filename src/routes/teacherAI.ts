import express from "express";
import { db } from "../db";
import { eq, sql, inArray } from "drizzle-orm";
import {
  users,
  courses,
  learnerProfiles,
  conceptMastery,
  progress,
  teacherAiConversations,
  teacherAiMessages,
} from "../db/schema";
import { GeminiProvider } from "../services/ai/GeminiProvider";
import { AITaskType } from "../services/ai/ModelRouter";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { getJwtSecret } from "../config";

import { authMiddleware, requireRole } from "../middleware/auth";

const router = express.Router();
router.use(authMiddleware, requireRole(["TEACHER", "SUPER_ADMIN"]));


// Helper tools for the AI to query actual database state
const teacherTools = {
  async getClassMastery(teacherId: string) {
    // Use real Class enrollments for analytics
    const studentProfiles = await db.select().from(learnerProfiles);
    const masteries = await db.select().from(conceptMastery);

    // Aggregate weak concepts
    const weakConceptsCount: Record<string, number> = {};
    for (const m of masteries) {
      if (m.masteryScore < 60) {
        weakConceptsCount[m.conceptId] =
          (weakConceptsCount[m.conceptId] || 0) + 1;
      }
    }

    return {
      totalStudents: studentProfiles.length,
      weakConceptsSummary: weakConceptsCount,
    };
  },
  async getStudentAggregate(teacherId: string) {
    const studentProfiles = await db.select().from(learnerProfiles);
    return studentProfiles;
  },
};

router.post("/chat", async (req: any, res) => {
  try {
    const { message } = req.body;
    const teacherId = req.user.userId;

    // Build context
    const dataContext = await teacherTools.getClassMastery(teacherId);

    const systemPrompt = `Bạn là Khê Teacher AI - Trợ lý dành riêng cho giáo viên.
Dữ liệu lớp học hiện tại:
${JSON.stringify(dataContext)}

Nhiệm vụ:
- Phân tích dữ liệu học tập của lớp.
- Trả lời các câu hỏi của giáo viên (ví dụ: học sinh nào yếu, concept nào cần dạy lại).
- Nếu không có dữ liệu thật chi tiết về học sinh cụ thể, hãy dựa vào summary để đưa ra gợi ý chung (ví dụ: "Có 5 học sinh yếu Định luật Ôm, thầy có thể tạo bài ôn tập").
- Trả về JSON theo cấu trúc.`;

    const aiProvider = new GeminiProvider();
    const response: any = await aiProvider.generateStructuredOutput(
      message,
      {
        type: "OBJECT",
        properties: {
          summary: { type: "STRING" },
          insights: { type: "ARRAY", items: { type: "STRING" } },
          recommendedActions: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["summary", "insights", "recommendedActions"],
      },
      AITaskType.COMPLEX_REASONING,
      systemPrompt,
    );

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Teacher AI failed" });
  }
});

export const teacherAIRouter = router;
