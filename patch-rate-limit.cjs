const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const globalLimiterCode = `  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false, xForwardedForHeader: false },
  });`;

const globalLimiterCodeNew = `  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false, xForwardedForHeader: false },
    message: { error: "Too many requests, please try again later." },
  });`;

const aiLimiterCode = `  const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // 100 AI requests per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false, xForwardedForHeader: false },
  });`;

const aiLimiterCodeNew = `  const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // 100 AI requests per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false, xForwardedForHeader: false },
    message: { error: "Too many AI requests, please try again later." },
  });`;

code = code.replace(globalLimiterCode, globalLimiterCodeNew);
code = code.replace(aiLimiterCode, aiLimiterCodeNew);

fs.writeFileSync('server.ts', code);
