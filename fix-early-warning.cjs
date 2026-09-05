const fs = require('fs');

let content = fs.readFileSync('src/routes/earlyWarning.ts', 'utf8');

const oldAuth = `const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  try {
    const decoded: any = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'TEACHER') {
        return res.status(403).json({ error: 'Forbidden. Teacher only.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.use(authMiddleware);`;

const newAuth = `import { authMiddleware, requireRole } from '../middleware/auth';
router.use(authMiddleware);
router.use(requireRole(['TEACHER', 'SUPER_ADMIN']));`;

content = content.replace(oldAuth, newAuth);

fs.writeFileSync('src/routes/earlyWarning.ts', content);
