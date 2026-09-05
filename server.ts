import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { db } from './src/db';
import { users, roles, courses } from './src/db/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { aiRouter } from './src/routes/ai';
import { learningRouter } from './src/routes/learning';
import { teacherAIRouter } from './src/routes/teacherAI';
import { examPrepRouter } from './src/routes/examPrep';
import { earlyWarningRouter } from './src/routes/earlyWarning';
import { classesRouter } from './src/routes/classes';
import { assignmentsRouter } from './src/routes/assignments';
import { gamificationRouter } from './src/routes/gamification';
import { notificationsRouter } from './src/routes/notifications';
import { analyticsRouter } from './src/routes/analytics';

const JWT_SECRET = process.env.JWT_SECRET || 'phk-stem-lab-super-secret-key-2026';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

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


  // --- API ROUTES ---
  app.use('/api/ai', aiRouter);
  app.use('/api/learning', learningRouter);
  app.use('/api/teacher/ai', teacherAIRouter);
  app.use('/api/exam-preparation', examPrepRouter);
  app.use('/api/early-warning', earlyWarningRouter);
  app.use('/api/classes', classesRouter);
  app.use('/api/assignments', assignmentsRouter);
  app.use('/api/gamification', gamificationRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/analytics', analyticsRouter);

  // Auth: Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (userResult.length === 0) {
        return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
      }

      const user = userResult[0];
      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
      }

      const roleResult = await db.select().from(roles).where(eq(roles.id, user.roleId)).limit(1);
      const role = roleResult[0].name;

      const token = jwt.sign(
        { userId: user.id, email: user.email, role, name: user.name },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Lỗi server' });
    }
  });

  // Example Protected Route
  app.get('/api/users/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ user: decoded });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Example API: Get courses
  app.get('/api/courses', async (req, res) => {
    try {
      const allCourses = await db.select().from(courses);
      res.json({ courses: allCourses });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  });


  // --- VITE MIDDLEWARE (Frontend) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
