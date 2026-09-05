export enum AITaskType {
  NORMAL_TASK = 'NORMAL_TASK',
  COMPLEX_REASONING = 'COMPLEX_REASONING',
  LOW_CONFIDENCE = 'LOW_CONFIDENCE',
  PHYSICS_VALIDATION = 'PHYSICS_VALIDATION',
  EXERCISE_GENERATION = 'EXERCISE_GENERATION',
  HIGH_VOLUME_TASK = 'HIGH_VOLUME_TASK',
}

export class ModelRouter {
  static getModelForTask(taskType: AITaskType): string {
    let fastModel = process.env.GEMINI_FAST_MODEL || 'gemini-3.6-flash';
    let reasoningModel = process.env.GEMINI_REASONING_MODEL || 'gemini-3.6-flash';

    // Fallback if the user accidentally pastes an API key into the model variable
    if (fastModel.startsWith('AQ.') || fastModel.startsWith('AIza')) {
      fastModel = 'gemini-3.6-flash';
    }
    if (reasoningModel.startsWith('AQ.') || reasoningModel.startsWith('AIza')) {
      reasoningModel = 'gemini-3.6-flash';
    }

    switch (taskType) {
      case AITaskType.COMPLEX_REASONING:
      case AITaskType.LOW_CONFIDENCE:
      case AITaskType.PHYSICS_VALIDATION:
        return reasoningModel;
      case AITaskType.NORMAL_TASK:
      case AITaskType.EXERCISE_GENERATION:
      case AITaskType.HIGH_VOLUME_TASK:
      default:
        return fastModel;
    }
  }
}
