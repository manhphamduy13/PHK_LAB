const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldHealth = `  app.get("/health", async (_req, res) => {
    let database = "ok";
    try {
      await db.select().from(roles).limit(1);
    } catch {
      database = "error";
    }
    const storage = await storageProvider.exists("");
    res.status(database === "ok" && storage ? 200 : 503).json({
      status: database === "ok" && storage ? "ok" : "degraded",
      database,
      storage: storage ? "ok" : "error",
      ai: process.env.GEMINI_API_KEY ? "configured" : "not_configured",
    });
  });`;

const newHealth = `  let aiStatusCache = { status: "unknown", lastChecked: 0 };
  app.get("/health", async (_req, res) => {
    let database = "ok";
    try {
      await db.select().from(roles).limit(1);
    } catch {
      database = "error";
    }
    const storage = await storageProvider.exists("");
    
    let aiStatus = "not_configured";
    if (process.env.GEMINI_API_KEY) {
      if (Date.now() - aiStatusCache.lastChecked > 300000) { // 5 minutes cache
        try {
          const { GoogleGenAI } = await import("@google/genai");
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          await ai.models.generateContent({
            model: process.env.FAST_MODEL || process.env.GEMINI_FAST_MODEL || "gemini-2.5-flash",
            contents: "ping",
            config: { maxOutputTokens: 1 }
          });
          aiStatusCache = { status: "ok", lastChecked: Date.now() };
        } catch (e) {
          console.error("AI check error:", e);
          aiStatusCache = { status: "error", lastChecked: Date.now() };
        }
      }
      aiStatus = aiStatusCache.status;
    }

    res.status(database === "ok" && storage ? 200 : 503).json({
      status: database === "ok" && storage ? "ok" : "degraded",
      database,
      storage: storage ? "ok" : "error",
      ai: aiStatus,
    });
  });`;

code = code.replace(oldHealth, newHealth);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts");
