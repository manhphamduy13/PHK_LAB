const fs = require('fs');

const code = `export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const getHeaders = () => {
  const token = localStorage.getItem('phk_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': \`Bearer \${token}\` } : {})
  };
};

export class AITutorService {
  static async sendMessage(message: string, context?: any): Promise<string> {
    try {
      const res = await fetch('/api/student/ai/chat', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message, context })
      });
      const data = await res.json();
      return data.reply || "Xin lỗi, AI Tutor đang bảo trì.";
    } catch (e) {
      console.error(e);
      return "Xin lỗi, AI Tutor đang bảo trì hoặc chưa cấu hình đúng cách.";
    }
  }

  static async getHint(concept: string): Promise<string> {
    try {
      const res = await fetch('/api/student/ai/hint', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ concept })
      });
      const data = await res.json();
      return data.hint || "Không lấy được gợi ý, vui lòng thử lại sau.";
    } catch (e) {
      console.error(e);
      return "Không lấy được gợi ý, vui lòng thử lại sau.";
    }
  }

  static async simplifyExplanation(text: string): Promise<string> {
    try {
      const res = await fetch('/api/student/ai/simplify', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      return data.simplified || "Không lấy được giải thích, vui lòng thử lại sau.";
    } catch (e) {
      console.error(e);
      return "Không lấy được giải thích, vui lòng thử lại sau.";
    }
  }
}
`;

fs.writeFileSync('src/services/aiTutorService.ts', code);
