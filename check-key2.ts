import "dotenv/config";
const key = process.env.GEMINI_API_KEY || "";
console.log("Length:", key.length);
console.log("Starts with AIza?", key.startsWith("AIza"));
console.log("Key value snippet:", key.substring(0, 10));
