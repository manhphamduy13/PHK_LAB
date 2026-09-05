import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { ModelRouter, AITaskType } from "./src/services/ai/ModelRouter.js";

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("NO_KEY");
    process.exit(1);
  }
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Reply with exactly: PHK STEM LAB AI TEST OK",
    });
    console.log("RESPONSE:", response.text);
  } catch (e) {
    console.error("ERROR:", e);
    process.exit(1);
  }
}
run();
