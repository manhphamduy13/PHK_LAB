export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export class AITutorService {
  static async sendMessage(message: string, context?: any): Promise<string> {
    try {
      const res = await fetch("/api/student/ai/chat", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ message, context }),
      });
      if (!res.ok) {
        if (res.status === 429)
          return "Hệ thống đang quá tải, vui lòng thử lại sau ít phút.";
        return "Xin lỗi, đã có lỗi kết nối tới AI Tutor.";
      }
      const data = await res.json();
      return data.reply || "Xin lỗi, AI Tutor đang bảo trì.";
    } catch (e) {
      console.error(e);
      return "Xin lỗi, AI Tutor đang bảo trì hoặc chưa cấu hình đúng cách.";
    }
  }

  static async getHint(concept: string): Promise<string> {
    try {
      const res = await fetch("/api/student/ai/hint", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ concept }),
      });
      if (!res.ok) return "Không lấy được gợi ý, vui lòng thử lại sau.";
      const data = await res.json();
      return data.hint || "Không lấy được gợi ý, vui lòng thử lại sau.";
    } catch (e) {
      console.error(e);
      return "Không lấy được gợi ý, vui lòng thử lại sau.";
    }
  }

  static async simplifyExplanation(text: string): Promise<string> {
    try {
      const res = await fetch("/api/student/ai/simplify", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return "Không lấy được giải thích, vui lòng thử lại sau.";
      const data = await res.json();
      return (
        data.simplified || "Không lấy được giải thích, vui lòng thử lại sau."
      );
    } catch (e) {
      console.error(e);
      return "Không lấy được giải thích, vui lòng thử lại sau.";
    }
  }
}
