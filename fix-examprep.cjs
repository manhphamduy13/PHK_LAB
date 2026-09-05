const fs = require('fs');

let content = fs.readFileSync('src/routes/examPrep.ts', 'utf8');

const badCall = `    const response: any = await aiProvider.generateStructuredOutput(
        systemPrompt,
        "Lên kế hoạch",
        {
            type: "OBJECT",
            properties: {
                topics: { type: "ARRAY", items: { type: "STRING" } },
                schedule: { type: "STRING" }
            },
            required: ["topics", "schedule"]
        },
        "FAST"
    );`;

const goodCall = `    const response: any = await aiProvider.generateStructuredOutput(
        "Lên kế hoạch",
        {
            type: "OBJECT",
            properties: {
                topics: { type: "ARRAY", items: { type: "STRING" } },
                schedule: { type: "STRING" }
            },
            required: ["topics", "schedule"]
        },
        AITaskType.COMPLEX_REASONING,
        systemPrompt
    );`;

content = content.replace(badCall, goodCall);

if (!content.includes('import { AITaskType }')) {
    content = content.replace("import { GeminiProvider } from '../services/ai/GeminiProvider';", "import { GeminiProvider } from '../services/ai/GeminiProvider';\nimport { AITaskType } from '../services/ai/ModelRouter';");
}

fs.writeFileSync('src/routes/examPrep.ts', content);
