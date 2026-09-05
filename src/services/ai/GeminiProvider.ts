import { GoogleGenAI, Type } from '@google/genai';
import { ModelRouter, AITaskType } from './ModelRouter';

export class GeminiProvider {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing.');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateStructuredOutput<T>(
    promptOrContents: string | any[],
    schema: any, // Zod schema or raw JSON schema definition
    taskType: AITaskType = AITaskType.NORMAL_TASK,
    systemInstruction?: string
  ): Promise<T> {
    const model = ModelRouter.getModelForTask(taskType);
    
    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: promptOrContents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          systemInstruction: systemInstruction,
          temperature: 0.2, // Low temperature for extraction
        }
      });
      
      const text = response.text;
      if (!text) {
        throw new Error('Empty response from model');
      }
      return JSON.parse(text) as T;
    } catch (error) {
      console.error(`Error in generateStructuredOutput with model ${model}:`, error);
      throw error;
    }
  }
}

export const aiProvider = new GeminiProvider();
