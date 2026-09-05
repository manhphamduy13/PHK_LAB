const fs = require('fs');

function unifyAuth(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    const badRegex = /const authMiddleware[\s\S]*?router\.use\(authMiddleware\);/;
    const newAuth = `import { authMiddleware, requireRole } from '../middleware/auth';\nrouter.use(authMiddleware);`;
    
    if (content.match(badRegex)) {
       content = content.replace(badRegex, newAuth);
       fs.writeFileSync(file, content);
       console.log('Fixed', file);
    }
}

['src/routes/classes.ts', 'src/routes/analytics.ts', 'src/routes/assignments.ts', 'src/routes/gamification.ts', 'src/routes/notifications.ts'].forEach(unifyAuth);
