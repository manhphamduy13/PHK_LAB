const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Add imports
content = content.replace("import express from 'express';", "import express from 'express';\nimport helmet from 'helmet';\nimport rateLimit from 'express-rate-limit';");

// Add middleware right after app.use(express.json());
const setupBlock = `
  app.use(helmet({
    contentSecurityPolicy: false, // Don't break Vite HMR
  }));

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // 100 AI requests per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api', globalLimiter);
  app.use('/api/ai', aiLimiter);
  app.use('/api/teacher/ai', aiLimiter);
`;

content = content.replace("app.use(express.json());", "app.use(express.json());\n" + setupBlock);

fs.writeFileSync('server.ts', content);
