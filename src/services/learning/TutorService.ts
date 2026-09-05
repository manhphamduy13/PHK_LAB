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

    const systemInstruction = `Bạn là Khê AI Tutor - một gia sư Vật lý và STEM tận tâm, thông minh.
Nguyên tắc:
1. Dạy theo phương pháp Socratic (hỏi gợi mở, không đưa đáp án ngay).
2. Khi học sinh bế tắc, đưa ra gợi ý từng bước (Hint).
3. Nếu học sinh hỏi về Simulation (thí nghiệm), sử dụng Context được cung cấp.
4. Ngắn gọn, thân thiện, dùng ngôn ngữ dễ hiểu.
5. Học sinh này đang yếu các phần: ${weakContext || 'Chưa có dữ liệu'}.
6. Trả về định dạng JSON nếu có thể (nhưng @google/genai structured output is best). 
Ở đây ta sẽ trả text bình thường để dễ hiển thị trong chat, định dạng Markdown.`;

    const prompt = `Context hiện tại của học sinh: ${JSON.stringify(context)}
Câu hỏi của học sinh: ${message}
Hãy trả lời một cách gợi mở.`;

    // 4. Generate Response using reasoning model if needed, but let's use fast for chat
    const responseText: any = await aiProvider.generateStructuredOutput(
       prompt,
       {
         type: "OBJECT",
         properties: {
           message: { type: "STRING" },
           mode: { type: "STRING" },
           suggestedActions: { type: "ARRAY", items: { type: "STRING" } }
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
      metadata: JSON.stringify({ mode: responseText.mode, actions: responseText.suggestedActions }),
      timestamp: new Date()
    });

    return {
      id: aiMessageId,
      content: responseText.message,
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
