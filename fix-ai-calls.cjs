const fs = require('fs');

function fixTeacherAI() {
    let content = fs.readFileSync('src/routes/teacherAI.ts', 'utf8');
    
    // Replace the bad call
    const badCall = `    const response: any = await aiProvider.generateStructuredOutput(
        systemPrompt,
        message,
        {
            type: "OBJECT",
            properties: {
                summary: { type: "STRING" },
                insights: { type: "ARRAY", items: { type: "STRING" } },
                recommendedActions: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ["summary", "insights", "recommendedActions"]
        },
        "FAST"
    );`;
    
    const goodCall = `    const response: any = await aiProvider.generateStructuredOutput(
        message,
        {
            type: "OBJECT",
            properties: {
                summary: { type: "STRING" },
                insights: { type: "ARRAY", items: { type: "STRING" } },
                recommendedActions: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ["summary", "insights", "recommendedActions"]
        },
        AITaskType.COMPLEX_REASONING,
        systemPrompt
    );`;
    
    content = content.replace(badCall, goodCall);
    
    if (!content.includes('import { AITaskType }')) {
        content = content.replace("import { GeminiProvider } from '../services/ai/GeminiProvider';", "import { GeminiProvider } from '../services/ai/GeminiProvider';\nimport { AITaskType } from '../services/ai/ModelRouter';");
    }
    
    fs.writeFileSync('src/routes/teacherAI.ts', content);
}

function fixExamPrep() {
    let content = fs.readFileSync('src/routes/examPrep.ts', 'utf8');
    
    const badCall = `    const aiResponse: any = await aiProvider.generateStructuredOutput(
        prompt,
        "",
        {
            type: "OBJECT",
            properties: {
                topics: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                },
                schedule: { type: "STRING" }
            },
            required: ["topics", "schedule"]
        },
        "FAST"
    );`;
    
    const goodCall = `    const aiResponse: any = await aiProvider.generateStructuredOutput(
        prompt,
        {
            type: "OBJECT",
            properties: {
                topics: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                },
                schedule: { type: "STRING" }
            },
            required: ["topics", "schedule"]
        },
        AITaskType.COMPLEX_REASONING
    );`;
    
    content = content.replace(badCall, goodCall);
    
    if (!content.includes('import { AITaskType }')) {
        content = content.replace("import { GeminiProvider } from '../services/ai/GeminiProvider';", "import { GeminiProvider } from '../services/ai/GeminiProvider';\nimport { AITaskType } from '../services/ai/ModelRouter';");
    }
    
    fs.writeFileSync('src/routes/examPrep.ts', content);
}

fixTeacherAI();
fixExamPrep();
