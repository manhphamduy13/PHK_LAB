import express from "express";
import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import {
  assignments,
  studentAssignments,
  enrollments,
  classes,
} from "../db/schema";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { getJwtSecret } from "../config";

const router = express.Router();
const JWT_SECRET = getJwtSecret();

import { authMiddleware, requireRole } from "../middleware/auth";
router.use(authMiddleware);

// Create assignment (Teacher)
router.post("/", async (req: any, res) => {
  try {
    if (req.user.role !== "TEACHER" && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const {
      title,
      description,
      classId,
      courseId,
      lessonId,
      type,
      startDate,
      dueDate,
    } = req.body;
    const teacherId = req.user.userId;
    if (req.user.role === "TEACHER") {
      const ownedClass = await db
        .select()
        .from(classes)
        .where(and(eq(classes.id, classId), eq(classes.teacherId, teacherId)))
        .limit(1);
      if (ownedClass.length === 0)
        return res.status(403).json({ error: "You do not own this class" });
    }

    const assignment = {
      id: uuidv4(),
      title,
      description,
      teacherId,
      classId,
      courseId,
      lessonId,
      type,
      startDate: new Date(startDate),
      dueDate: new Date(dueDate),
      status: "PUBLISHED",
      createdAt: new Date(),
    };
    await db.insert(assignments).values(assignment);

    // Assign to all students in class
    const studentsInClass = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.classId, classId));

    for (const student of studentsInClass) {
      await db.insert(studentAssignments).values({
        id: uuidv4(),
        assignmentId: assignment.id,
        studentId: student.studentId,
        status: "NOT_STARTED",
      });
    }

    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get assignments for student
router.get("/my", async (req: any, res) => {
  try {
    const studentId = req.user.userId;
    const myAssignments = await db
      .select({
        id: studentAssignments.id,
        assignmentId: assignments.id,
        title: assignments.title,
        type: assignments.type,
        dueDate: assignments.dueDate,
        status: studentAssignments.status,
        score: studentAssignments.score,
      })
      .from(studentAssignments)
      .innerJoin(
        assignments,
        eq(studentAssignments.assignmentId, assignments.id),
      )
      .where(eq(studentAssignments.studentId, studentId));

    res.json(myAssignments);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export const assignmentsRouter = router;
