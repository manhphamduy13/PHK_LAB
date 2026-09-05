import { aiProvider } from '../GeminiProvider';
import { AITaskType } from '../ModelRouter';

export class ContentValidator {
  static async validatePhysicsConcepts(concepts: string[]) {
    const validationSchema = {
      type: "OBJECT",
      properties: {
        isValid: { type: "BOOLEAN" },
        issues: { type: "ARRAY", items: { type: "STRING" } }
      }
    };
    
    return await aiProvider.generateStructuredOutput(
      `Validate the following extracted concepts for physical correctness: ${JSON.stringify(concepts)}`,
      validationSchema,
      AITaskType.PHYSICS_VALIDATION,
      "You are a PhD physicist validating extracted concepts. Be strict about physics laws."
    );
  }
}
