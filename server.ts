import "dotenv/config";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { db } from "./src/db";
import { users, roles, courses } from "./src/db/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { aiRouter } from "./src/routes/ai";
import { learningRouter } from "./src/routes/learning";
import { coursesRouter } from "./src/routes/courses";
import { exercisesRouter } from "./src/routes/exercises";
import { usersRouter } from "./src/routes/users";
import { teacherAIRouter } from "./src/routes/teacherAI";
import { examPrepRouter } from "./src/routes/examPrep";
import { earlyWarningRouter } from "./src/routes/earlyWarning";
import { classesRouter } from "./src/routes/classes";
import { assignmentsRouter } from "./src/routes/assignments";
import { gamificationRouter } from "./src/routes/gamification";
import { notificationsRouter } from "./src/routes/notifications";
import { analyticsRouter } from "./src/routes/analytics";
import { studentAIRouter } from "./src/routes/studentAI";
import { authMiddleware, requireRole } from "./src/middleware/auth";
import { auditLogsRouter } from "./src/routes/auditLogs";
import { questionsRouter } from "./src/routes/questions";
import { appConfig, getJwtSecret, isProduction } from "./src/config";
import { storageProvider } from "./src/services/storage";

const JWT_SECRET = getJwtSecret();

async function startServer() {
  const app = express();

  // Trust the first proxy to correctly resolve user IPs for rate limiting
  app.set("trust proxy", 1);

  const PORT = appConfig.port;
  const fs = await import("fs/promises");
  await fs.mkdir(appConfig.storageRoot, { recursive: true });

  app.use(
    cors({
      origin: appConfig.frontendUrl || (isProduction ? false : true),
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json());

  app.use(
    helmet({
      contentSecurityPolicy: false, // Don't break Vite HMR
    }),
  );

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false, xForwardedForHeader: false },
    handler: (req, res, next, options) => {
      res
        .status(options.statusCode)
        .json({ error: "Too many requests, please try again later." });
    },
  });

  const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // 100 AI requests per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false, xForwardedForHeader: false },
    handler: (req, res, next, options) => {
      res
        .status(options.statusCode)
        .json({ error: "Too many AI requests, please try again later." });
    },
  });

  app.use("/api", globalLimiter);
  app.use("/api/ai", aiLimiter);
  app.use("/api/teacher/ai", aiLimiter);

  // --- API ROUTES ---
  app.use("/api/ai", aiRouter);

  app.get("/api/classes/options", async (_req, res) => {
    try {
      const { classes, users } = await import("./src/db/schema");
      const rows = await db
        .select({
          id: classes.id,
          name: classes.name,
          teacherId: classes.teacherId,
          teacherName: users.name,
        })
        .from(classes)
        .innerJoin(users, eq(classes.teacherId, users.id));
      res.json(rows);
    } catch {
      res.status(500).json({ error: "Failed to load class options" });
    }
  });
  app.use("/api/learning", learningRouter);
  app.use("/api/teacher/ai", teacherAIRouter);
  app.use("/api/exam-preparation", examPrepRouter);
  app.use("/api/early-warning", earlyWarningRouter);
  app.use("/api/classes", classesRouter);
  app.use("/api/courses", coursesRouter);
  app.use("/api/exercises", exercisesRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/assignments", assignmentsRouter);
  app.use("/api/gamification", gamificationRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/student/ai", studentAIRouter);
  app.use("/api/audit-logs", auditLogsRouter);
  app.use("/api/audit-log", auditLogsRouter);
  app.use("/api/questions", questionsRouter);

  app.get(
    "/api/admin/stats",
    authMiddleware,
    requireRole(["TEACHER", "SUPER_ADMIN"]),
    async (req: any, res) => {
      try {
        const {
          users: userTable,
          courses: courseTable,
          lessons: lessonTable,
          exercises: exerciseTable,
          questions: questionTable,
          aiJobs: jobTable,
          classes: classTable,
          enrollments: enrollmentTable,
          assignments: assignTable,
        } = await import("./src/db/schema");
        const teacherId = req.user.userId;

        const myCourses =
          req.user.role === "TEACHER"
            ? await db
                .select()
                .from(courseTable)
                .where(eq(courseTable.teacherId, teacherId))
            : await db.select().from(courseTable);
        const myClasses =
          req.user.role === "TEACHER"
            ? await db
                .select()
                .from(classTable)
                .where(eq(classTable.teacherId, teacherId))
            : await db.select().from(classTable);
        const myClassIds = myClasses.map((c: any) => c.id);

        const enrollmentsRow =
          myClassIds.length > 0
            ? await db
                .select({
                  studentId: enrollmentTable.studentId,
                })
                .from(enrollmentTable)
                .where(
                  sql`${enrollmentTable.classId} IN (${sql.join(
                    (myClassIds as any[]).map((id: any) => sql`${id}`),
                    sql`, `,
                  )})`,
                )
            : [];
        const studentIds = Array.from(
          new Set(enrollmentsRow.map((r: any) => r.studentId)),
        );
        const myStudents =
          studentIds.length > 0
            ? await db
                .select({
                  id: userTable.id,
                  name: userTable.name,
                  email: userTable.email,
                  createdAt: userTable.createdAt,
                })
                .from(userTable)
                .where(
                  sql`${userTable.id} IN (${sql.join(
                    (studentIds as any[]).map((id: any) => sql`${id}`),
                    sql`, `,
                  )})`,
                )
            : [];

        const [
          courseCount,
          lessonCount,
          publishedLessons,
          exerciseCount,
          questionCount,
          aiCount,
        ] = await Promise.all([
          db.select({ count: sql<number>`count(*)` }).from(courseTable),
          db.select({ count: sql<number>`count(*)` }).from(lessonTable),
          db
            .select({ count: sql<number>`count(*)` })
            .from(lessonTable)
            .where(eq(lessonTable.status, "PUBLISHED")),
          db.select({ count: sql<number>`count(*)` }).from(exerciseTable),
          db.select({ count: sql<number>`count(*)` }).from(questionTable),
          db
            .select({ count: sql<number>`count(*)` })
            .from(jobTable)
            .where(eq(jobTable.status, "COMPLETED")),
        ]);

        // Real recent activity: latest assignments in teacher's classes
        const recentActivity =
          myClassIds.length > 0
            ? await db
                .select({
                  id: assignTable.id,
                  action: sql`'GIAO_BAI'`,
                  resourceType: sql`'ASSIGNMENT'`,
                  resourceId: assignTable.id,
                  title: assignTable.title,
                  createdAt: assignTable.createdAt,
                })
                .from(assignTable)
                .where(
                  sql`${assignTable.classId} IN (${sql.join(
                    (myClassIds as any[]).map((id: any) => sql`${id}`),
                    sql`, `,
                  )})`,
                )
                .orderBy(sql`${assignTable.createdAt} DESC`)
                .limit(5)
            : [];

        res.json({
          totalStudents: myStudents.length,
          activeStudents: myStudents.length,
          courses: myCourses.length,
          lessons: Number(lessonCount[0]?.count || 0),
          published: Number(publishedLessons[0]?.count || 0),
          exercises: Number(exerciseCount[0]?.count || 0),
          questions: Number(questionCount[0]?.count || 0),
          aiContent: Number(aiCount[0]?.count || 0),
          recentActivity,
          students: myStudents,
        });
      } catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).json({ error: "Failed to load dashboard statistics" });
      }
    },
  );

  let aiStatusCache = { status: "unknown", lastChecked: 0 };
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
      if (Date.now() - aiStatusCache.lastChecked > 300000) {
        // 5 mins
        try {
          const { GoogleGenAI } = await import("@google/genai");
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          await ai.models.generateContent({
            model:
              process.env.FAST_MODEL ||
              process.env.GEMINI_FAST_MODEL ||
              "gemini-3.8-flash",
            contents: "ping",
            config: { maxOutputTokens: 1 },
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
  });

  // Auth: Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (userResult.length === 0) {
        return res
          .status(401)
          .json({ error: "Email hoặc mật khẩu không đúng" });
      }

      const user = userResult[0];
      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return res
          .status(401)
          .json({ error: "Email hoặc mật khẩu không đúng" });
      }

      const roleResult = await db
        .select()
        .from(roles)
        .where(eq(roles.id, user.roleId))
        .limit(1);
      const role = roleResult[0].name;

      const token = jwt.sign(
        { userId: user.id, email: user.email, role, name: user.name },
        JWT_SECRET,
        { expiresIn: "1d" },
      );

      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, classId } = req.body;
      if (
        !name?.trim() ||
        !email?.trim() ||
        typeof password !== "string" ||
        password.length < 8
      ) {
        return res
          .status(400)
          .json({ error: "Vui lòng nhập đủ thông tin và mật khẩu từ 8 ký tự" });
      }
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);
      if (existingUser.length > 0)
        return res.status(409).json({ error: "Email này đã được sử dụng" });
      const studentRole = await db
        .select()
        .from(roles)
        .where(eq(roles.name, "STUDENT"))
        .limit(1);
      if (studentRole.length === 0)
        return res
          .status(500)
          .json({ error: "Chưa cấu hình vai trò học sinh" });
      if (classId) {
        const { classes } = await import("./src/db/schema");
        const selectedClass = await db
          .select()
          .from(classes)
          .where(eq(classes.id, classId))
          .limit(1);
        if (selectedClass.length === 0)
          return res.status(400).json({ error: "Lớp học không tồn tại" });
      }
      const userId = randomUUID();
      const displayName = name.trim();
      await db.insert(users).values({
        id: userId,
        name: displayName,
        email: normalizedEmail,
        password: await bcrypt.hash(password, 10),
        roleId: studentRole[0].id,
        createdAt: new Date(),
      });
      if (classId) {
        const { classes, enrollments } = await import("./src/db/schema");
        const selectedClass = await db
          .select()
          .from(classes)
          .where(eq(classes.id, classId))
          .limit(1);
        if (selectedClass.length === 0)
          return res.status(400).json({ error: "Lớp học không tồn tại" });
        await db.insert(enrollments).values({
          id: randomUUID(),
          studentId: userId,
          classId,
          enrolledAt: new Date(),
        });
      }
      const { learnerProfiles } = await import("./src/db/schema");
      await db.insert(learnerProfiles).values({
        studentId: userId,
        grade: null,
        preferredDifficulty: "medium",
        learningStreak: 0,
        totalXp: 0,
        weakConcepts: "[]",
        strongConcepts: "[]",
        lastActiveAt: null,
      });
      const token = jwt.sign(
        { userId, email: normalizedEmail, role: "STUDENT", name: displayName },
        JWT_SECRET,
        { expiresIn: "1d" },
      );
      res.status(201).json({
        token,
        user: {
          id: userId,
          name: displayName,
          email: normalizedEmail,
          role: "STUDENT",
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Không thể tạo tài khoản lúc này" });
    }
  });

  // Example Protected Route
  app.get("/api/users/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ user: decoded });
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // Example API: Get courses
  app.get("/api/courses", async (req, res) => {
    try {
      const allCourses = await db.select().from(courses);
      res.json({ courses: allCourses });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  // --- VITE MIDDLEWARE (Frontend) ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.use(
    (
      error: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      const errorId = randomUUID();
      console.error(`[${errorId}]`, error);
      res.status(500).json({ error: "Internal server error", errorId });
    },
  );

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
