import { aiProvider } from '../ai/GeminiProvider';
import { AITaskType } from '../ai/ModelRouter';
import { db } from '../../db';
import { aiConversations, aiMessages, conceptMastery } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export class TutorService {
  static async handleStudentMessage(studentId: string, lessonId: string | null, message: string, context: any) {
    // 1. Find or create conversation
    let convs = await db.select().from(aiConversations).where(eq(aiConversations.studentId, studentId));
    let convId = convs.length > 0 ? convs[0].id : null;
    
    if (!convId) {
      convId = uuidv4();
      await db.insert(aiConversations).values({
        id: convId,
        studentId,
        lessonId: lessonId || '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      await db.update(aiConversations).set({ updatedAt: new Date() }).where(eq(aiConversations.id, convId));
    }

    // 2. Save user message
    await db.insert(aiMessages).values({
      id: uuidv4(),
      conversationId: convId,
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // 3. Build Prompt
    const masteries = await db.select().from(conceptMastery).where(eq(conceptMastery.studentId, studentId));
    const weakContext = masteries.filter(m => m.masteryScore < 60).map(m => m.conceptId).join(', ');
    const strongContext = masteries.filter(m => m.masteryScore >= 80).map(m => m.conceptId).join(', ');

    const systemInstruction = `Bạn là Khê AI Tutor - một gia sư Vật lý và STEM tận tâm, thông minh.
Nguyên tắc Socratic & Hint System:
1. KHÔNG BAO GIỜ đưa ra đáp án trực tiếp ngay lập tức. Luôn đặt câu hỏi ngược lại để dẫn dắt học sinh tự tìm ra câu trả lời (Socratic Method).
2. Khi học sinh bế tắc, đưa ra gợi ý từng bước (Hint) qua thuộc tính "hint" trong JSON để giao diện có thể hiển thị dưới dạng trợ giúp phụ.
3. Nếu học sinh hỏi về Simulation (thí nghiệm), giải thích dựa trên Context cấu hình mô phỏng.
4. Ngắn gọn, thân thiện, dùng ngôn ngữ dễ hiểu. Khen ngợi nếu học sinh có ý đúng.
5. Học sinh này đang yếu các khái niệm: [${weakContext || 'Chưa có dữ liệu'}]. Hãy đặc biệt chú ý và giảng giải kỹ hơn khi đụng tới các khái niệm này.
6. Học sinh đã vững các khái niệm: [${strongContext || 'Chưa có dữ liệu'}]. Có thể dùng các khái niệm này làm ví dụ so sánh.`;

    const prompt = `Context (Thí nghiệm/Bài học) hiện tại: ${JSON.stringify(context || {})}
Câu hỏi của học sinh: ${message}
Phân tích và trả lời theo phương pháp Socratic. Nếu cần, cung cấp một hint (gợi ý) ngắn gọn.`;

    // 4. Generate Response using reasoning model if needed, but let's use fast for chat
    const responseText: any = await aiProvider.generateStructuredOutput(
       prompt,
       {
         type: "OBJECT",
         properties: {
           message: { type: "STRING", description: "Câu trả lời chính của gia sư theo phương pháp Socratic (dạng Markdown)." },
           hint: { type: "STRING", description: "Một gợi ý ngắn gọn (1 câu) nếu học sinh cần thêm trợ giúp để trả lời câu hỏi của gia sư." },
           mode: { type: "STRING", description: "Chế độ hiện tại, ví dụ: 'SOCRATIC', 'EXPLANATION', 'ENCOURAGEMENT'" },
           suggestedActions: { type: "ARRAY", items: { type: "STRING" }, description: "Các hành động gợi ý cho học sinh click vào." }
         },
         required: ["message", "mode"]
       },
       AITaskType.NORMAL_TASK,
       systemInstruction
    );

    // 5. Save AI message
    const aiMessageId = uuidv4();
    await db.insert(aiMessages).values({
      id: aiMessageId,
      conversationId: convId,
      role: 'assistant',
      content: responseText.message,
      metadata: JSON.stringify({ 
        mode: responseText.mode, 
        hint: responseText.hint,
        actions: responseText.suggestedActions 
      }),
      timestamp: new Date()
    });

    return {
      id: aiMessageId,
      content: responseText.message,
      hint: responseText.hint,
      mode: responseText.mode,
      suggestedActions: responseText.suggestedActions
    };
  }
  
  static async getConversation(studentId: string) {
    let convs = await db.select().from(aiConversations).where(eq(aiConversations.studentId, studentId));
    if (convs.length === 0) return [];
    
    const messages = await db.select().from(aiMessages)
      .where(eq(aiMessages.conversationId, convs[0].id))
      .orderBy(asc(aiMessages.timestamp));
      
    return messages;
  }
}

