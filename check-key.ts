import "dotenv/config";
const key = process.env.GEMINI_API_KEY || "";
console.log("Length:", key.length);
console.log("Starts with AIza?", key.startsWith("AIza"));
console.log("Starts with ya29?", key.startsWith("ya29"));
console.log("Includes ' ' (space)?", key.includes(" "));
