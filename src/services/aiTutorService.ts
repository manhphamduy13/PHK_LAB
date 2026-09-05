// AI Tutor Service Placeholder (Phase 1)
// Ready for Phase 5 integration with real AI models

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class AITutorService {
  static async sendMessage(message: string, context?: any): Promise<string> {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Đây là phản hồi mô phỏng từ AI Tutor cho tin nhắn: "${message}". Tính năng gọi API thật sẽ được triển khai ở Phase 5.`);
      }, 1000);
    });
  }

  static async getHint(concept: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(`Gợi ý: Hãy thử xem lại định nghĩa của ${concept} và áp dụng công thức tương ứng.`), 800);
    });
  }

  static async simplifyExplanation(text: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(`Giải thích đơn giản: ${text} có nghĩa là...`), 800);
    });
  }
}
