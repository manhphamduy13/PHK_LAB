import { aiProvider } from '../GeminiProvider';
import { AITaskType } from '../ModelRouter';

export class DocumentAnalyzer {
  static async extractKnowledge(filePart: any) {
    const extractionSchema = {
      type: "OBJECT",
      properties: {
        metadata: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            grade: { type: "INTEGER" },
            subject: { type: "STRING" }
          }
        },
        concepts: { type: "ARRAY", items: { type: "STRING" } },
        experiments: { 
           type: "ARRAY", 
           items: { 
             type: "OBJECT", 
             properties: {
                name: { type: "STRING" },
                description: { type: "STRING" }
             }
           } 
        },
        sections: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              content: { type: "STRING" }
            }
          }
        }
      },
      required: ["metadata", "concepts", "sections"]
    };

    return await aiProvider.generateStructuredOutput(
      [
        filePart,
        "Analyze this physics document and extract its structure, concepts, and any experiments mentioned."
      ],
      extractionSchema,
      AITaskType.NORMAL_TASK,
      "You are an expert physics teacher extracting knowledge from documents."
    );
  }
}
