import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: process.env.FAST_MODEL || "gemini-3.6-flash",
      contents: "Reply with exactly:\nPHK STEM LAB AI TEST OK",
    });
    console.log(response.text);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
