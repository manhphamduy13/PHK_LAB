const fs = require('fs');

const code = `import { GoogleGenAI, Type } from "@google/genai";
import { ModelRouter, AITaskType } from "./ModelRouter";
import { aiProvider as configuredProvider } from "../../config";

export class GeminiProvider {
  private ai: GoogleGenAI;

  constructor() {
    if (configuredProvider !== "gemini") {
      throw \`Unsupported AI_PROVIDER: \${configuredProvider}\`;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Using fallback key to prevent ADC.");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY_PLEASE_CONFIGURE_IN_AI_STUDIO_SECRETS" });
  }

  async generateText(
    prompt: string,
    taskType: AITaskType = AITaskType.NORMAL_TASK,
    systemInstruction?: string,
  ): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return "Đây là câu trả lời mô phỏng từ AI Tutor (do chưa cài GEMINI_API_KEY). Thầy có thể cài API Key để AI trả lời thông minh thật nhé!";
    }
    
    const model = ModelRouter.getModelForTask(taskType);
    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });
      return response.text || "";
    } catch (error) {
      console.error(\`Error in generateText with model \${model}:\`, error);
      throw error;
    }
  }

  async generateStructuredOutput<T>(
    promptOrContents: string | any[],
    schema: any, // Zod schema or raw JSON schema definition
    taskType: AITaskType = AITaskType.NORMAL_TASK,
    systemInstruction?: string,
  ): Promise<T> {
    if (!process.env.GEMINI_API_KEY) {
      console.log("Mock Mode Active: GEMINI_API_KEY is missing, returning simulated AI response.");
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (taskType === AITaskType.PHYSICS_VALIDATION) {
        return { isValid: true, issues: [] } as unknown as T;
      }
      
      if (taskType === AITaskType.COMPLEX_REASONING) {
        return {
          summary: "Đây là dữ liệu mô phỏng do chưa cấu hình API Key.",
          insights: ["Học sinh cần thực hành thêm về định luật Ôm.", "Một số học sinh đang gặp khó khăn với bài tập tự do."],
          recommendedActions: ["Tạo bài tập ôn tập.", "Phân công bài đọc thêm."]
        } as unknown as T;
      }
      
      // Default fallback for Document Analyzer or other tasks
      return {
        metadata: { title: "Tài liệu Mô Phỏng (Mock Data)", grade: 10, subject: "Physics" },
        concepts: ["Động lực học", "Lực ma sát"],
        experiments: [{ name: "Thí nghiệm mô phỏng", description: "Mô phỏng do thiếu API key" }],
        sections: [
          { title: "Phần 1: Lời ngỏ", content: "Đây là nội dung được tạo tự động vì hệ thống chưa được cấp API Key." },
          { title: "Phần 2: Bài học", content: "Hãy thêm GEMINI_API_KEY vào Secrets để dùng tính năng AI thật." }
        ]
      } as unknown as T;
    }

    const model = ModelRouter.getModelForTask(taskType);
    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: promptOrContents,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          systemInstruction: systemInstruction,
          temperature: 0.2, // Low temperature for extraction
        },
      });
      const text = response.text;
      if (!text) {
        throw new Error("Empty response from model");
      }
      return JSON.parse(text) as T;
    } catch (error) {
      console.error(
        \`Error in generateStructuredOutput with model \${model}:\`,
        error,
      );
      throw error;
    }
  }
}

export const aiProvider = new GeminiProvider();
`;

fs.writeFileSync('src/services/ai/GeminiProvider.ts', code);
