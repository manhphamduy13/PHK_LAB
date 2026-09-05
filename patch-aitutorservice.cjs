const fs = require('fs');

const code = `import { api } from './api';

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class AITutorService {
  static async sendMessage(message: string, context?: any): Promise<string> {
    try {
      const res = await api.post('/student/ai/chat', { message, context });
      return res.data.reply;
    } catch (e) {
      console.error(e);
      return "Xin lỗi, AI Tutor đang bảo trì hoặc chưa cấu hình đúng cách.";
    }
  }

  static async getHint(concept: string): Promise<string> {
    try {
      const res = await api.post('/student/ai/hint', { concept });
      return res.data.hint;
    } catch (e) {
      console.error(e);
      return "Không lấy được gợi ý, vui lòng thử lại sau.";
    }
  }

  static async simplifyExplanation(text: string): Promise<string> {
    try {
      const res = await api.post('/student/ai/simplify', { text });
      return res.data.simplified;
    } catch (e) {
      console.error(e);
      return "Không lấy được giải thích, vui lòng thử lại sau.";
    }
  }
}
`;

fs.writeFileSync('src/services/aiTutorService.ts', code);
