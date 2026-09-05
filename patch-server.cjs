const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const importTarget = 'import { analyticsRouter } from "./src/routes/analytics";';
const importReplace = importTarget + '\nimport { studentAIRouter } from "./src/routes/studentAI";';
code = code.replace(importTarget, importReplace);

const routeTarget = 'app.use("/api/analytics", analyticsRouter);';
const routeReplace = routeTarget + '\n  app.use("/api/student/ai", studentAIRouter);';
code = code.replace(routeTarget, routeReplace);

fs.writeFileSync('server.ts', code);
