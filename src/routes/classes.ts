import express from "express";
import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import { classes, enrollments, users, courses } from "../db/schema";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { getJwtSecret } from "../config";

const router = express.Router();
const JWT_SECRET = getJwtSecret();

import { authMiddleware, requireRole } from "../middleware/auth";
router.use(authMiddleware);

// Get teacher's classes
router.get("/", async (req: any, res) => {
  try {
    const teacherId = req.user.userId;
    if (req.user.role !== "TEACHER" && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const myClasses = await db
      .select()
      .from(classes)
      .where(eq(classes.teacherId, teacherId));
    res.json(myClasses);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create class
router.post("/", async (req: any, res) => {
  try {
    const teacherId = req.user.userId;
    if (req.user.role !== "TEACHER" && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { name, gradeId } = req.body;
    const newClass = {
      id: uuidv4(),
      name,
      teacherId,
      gradeId,
      createdAt: new Date(),
    };
    await db.insert(classes).values(newClass);
    res.json(newClass);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export const classesRouter = router;
