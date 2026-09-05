const fs = require('fs');
let code = fs.readFileSync('src/services/ai/GeminiProvider.ts', 'utf8');

const oldCode = `    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing.");
    }
    this.ai = new GoogleGenAI({ apiKey });`;

const newCode = `    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Using fallback key to prevent ADC.");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY_PLEASE_CONFIGURE_IN_AI_STUDIO_SECRETS" });`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/services/ai/GeminiProvider.ts', code);
console.log("Patched GeminiProvider.ts");
