import express from "express";
import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import {
  assignments,
  studentAssignments,
  enrollments,
  classes,
  notifications,
  lessons,
  exercises,
  users,
} from "../db/schema";
import { v4 as uuidv4 } from "uuid";
import { storageProvider } from "../services/storage";
import { sanitizeFilename, contentDisposition } from "../lib/fileNames";

const router = express.Router();

import { authMiddleware, requireRole } from "../middleware/auth";
router.use(authMiddleware);

// Helper: load an assignment or return null
async function loadAssignment(assignmentId: string) {
  const rows = await db
    .select()
    .from(assignments)
    .where(eq(assignments.id, assignmentId))
    .limit(1);
  return rows[0] || null;
}

// Helper: check a user is enrolled in a class
async function isEnrolled(studentId: string, classId: string): Promise<boolean> {
  const rows = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.studentId, studentId),
        eq(enrollments.classId, classId),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

// List lessons for assignment dropdown (teacher)
router.get(
  "/lesson-options",
  requireRole(["TEACHER", "SUPER_ADMIN"]),
  async (req: any, res) => {
    try {
      const all = await db.select().from(lessons);
      const { courses, chapters } = await import("../db/schema");
      const courseRows = await db.select().from(courses);
      const chapterRows = await db.select().from(chapters);
      res.json(
        all.map((l: any) => {
          const chapter = chapterRows.find((c: any) => c.id === l.chapterId);
          const course = courseRows.find((c: any) => c.id === chapter?.courseId);
          return {
            ...l,
            courseTitle: course?.title || "",
            chapterTitle: chapter?.title || "",
          };
        }),
      );
    } catch {
      res.status(500).json({ error: "Failed to load lessons" });
    }
  },
);

// List exercises for assignment dropdown (teacher)
router.get(
  "/exercise-options",
  requireRole(["TEACHER", "SUPER_ADMIN"]),
  async (_req, res) => {
    try {
      const all = await db.select().from(exercises);
      res.json(all);
    } catch {
      res.status(500).json({ error: "Failed to load exercises" });
    }
  },
);

// Create assignment (Teacher)
router.post(
  "/",
  requireRole(["TEACHER", "SUPER_ADMIN"]),
  async (req: any, res) => {
    try {
      const {
        title,
        description,
        classId,
        courseId,
        lessonId,
        exerciseId,
        type,
        startDate,
        dueDate,
        attachFile,
      } = req.body;
      const teacherId = req.user.userId;
      if (!title || !classId || !type || !dueDate) {
        return res
          .status(400)
          .json({ error: "title, classId, type and dueDate are required" });
      }
      if (req.user.role === "TEACHER") {
        const ownedClass = await db
          .select()
          .from(classes)
          .where(and(eq(classes.id, classId), eq(classes.teacherId, teacherId)))
          .limit(1);
        if (ownedClass.length === 0)
          return res.status(403).json({ error: "You do not own this class" });
      }

      // Validate linked resources
      if (lessonId) {
        const lesson = await db
          .select({ id: lessons.id })
          .from(lessons)
          .where(eq(lessons.id, lessonId))
          .limit(1);
        if (lesson.length === 0)
          return res.status(400).json({ error: "Bài giảng không tồn tại" });
      }
      if (exerciseId) {
        const exercise = await db
          .select({ id: exercises.id })
          .from(exercises)
          .where(eq(exercises.id, exerciseId))
          .limit(1);
        if (exercise.length === 0)
          return res.status(400).json({ error: "Bài tập không tồn tại" });
      }

      const assignment = {
        id: uuidv4(),
        title,
        description: description || "",
        teacherId,
        classId,
        courseId: courseId || null,
        lessonId: lessonId || null,
        exerciseId: exerciseId || null,
        type,
        startDate: new Date(startDate || Date.now()),
        dueDate: new Date(dueDate),
        status: "PUBLISHED",
        createdAt: new Date(),
      };
      await db.insert(assignments).values(assignment);

      // Attach file if provided (base64 encoded). The on-disk key is
      // sanitized so Vietnamese / spaced file names never break storage.
      if (attachFile?.data && attachFile?.filename) {
        try {
          const buffer = Buffer.from(attachFile.data, "base64");
          const storageKey = `assignment-files/${assignment.id}/${sanitizeFilename(attachFile.filename)}`;
          await storageProvider.upload(storageKey, buffer, {
            filename: attachFile.filename,
            mimeType: attachFile.mimeType || "application/octet-stream",
            size: buffer.length,
          });
          await db
            .update(assignments)
            .set({
              description: `${assignment.description || ""}\n\n📎 File đính kèm: ${attachFile.filename}`,
              attachFileKey: storageKey,
              attachFileName: attachFile.filename,
            })
            .where(eq(assignments.id, assignment.id));
        } catch (fileErr) {
          console.error("Failed to attach file to assignment:", fileErr);
        }
      }

      // Assign to all students in class + notifications
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
        await db.insert(notifications).values({
          id: uuidv4(),
          userId: student.studentId,
          type: "ASSIGNMENT",
          title: "Bài tập mới được giao",
          message: `Bạn được giao bài: ${title}`,
          resourceType: "ASSIGNMENT",
          resourceId: assignment.id,
          createdAt: new Date(),
        });
      }

      res.json(assignment);
    } catch (err) {
      console.error("Create assignment error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },
);

router.get(
  "/class/:classId",
  requireRole(["TEACHER", "SUPER_ADMIN"]),
  async (req: any, res) => {
    try {
      const teacherId = req.user.userId;
      const classId = req.params.classId;
      const owned = await db
        .select()
        .from(classes)
        .where(and(eq(classes.id, classId), eq(classes.teacherId, teacherId)))
        .limit(1);
      if (req.user.role !== "SUPER_ADMIN" && owned.length === 0) {
        return res.status(403).json({ error: "You do not own this class" });
      }

      const rows = await db
        .select()
        .from(assignments)
        .where(eq(assignments.classId, classId));

      // Calculate stats for each assignment
      const enriched = await Promise.all(
        rows.map(async (assign: any) => {
          const subs = await db
            .select({ status: studentAssignments.status })
            .from(studentAssignments)
            .where(eq(studentAssignments.assignmentId, assign.id));

          const totalAssigned = subs.length;
          const submittedCount = subs.filter(
            (s: any) => s.status === "SUBMITTED" || s.status === "GRADED",
          ).length;
          const gradedCount = subs.filter(
            (s: any) => s.status === "GRADED",
          ).length;

          return {
            ...assign,
            totalAssigned,
            submittedCount,
            gradedCount,
          };
        }),
      );

      res.json(enriched);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch class assignments" });
    }
  },
);

// Get all submissions for assignments of a class (teacher grading view)
router.get("/class/:classId/submissions", async (req: any, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.userId;
    const owned = await db
      .select()
      .from(classes)
      .where(and(eq(classes.id, classId), eq(classes.teacherId, teacherId)))
      .limit(1);
    if (req.user.role !== "SUPER_ADMIN" && owned.length === 0)
      return res.status(403).json({ error: "You do not own this class" });

    const classAssignments = await db
      .select()
      .from(assignments)
      .where(eq(assignments.classId, classId));
    if (classAssignments.length === 0) return res.json([]);

    const submissions = await db
      .select({
        id: studentAssignments.id,
        assignmentId: studentAssignments.assignmentId,
        studentId: studentAssignments.studentId,
        status: studentAssignments.status,
        score: studentAssignments.score,
        submissionComment: studentAssignments.submissionComment,
        submissionFileName: studentAssignments.submissionFileName,
        feedback: studentAssignments.feedback,
        gradedAt: studentAssignments.gradedAt,
        completedAt: studentAssignments.completedAt,
      })
      .from(studentAssignments)
      .where(
        sql`${studentAssignments.assignmentId} IN (${sql.join(
          classAssignments.map((a: any) => sql`${a.id}`),
          sql`, `,
        )})`,
      );

    const studentIds = Array.from(new Set(submissions.map((s: any) => s.studentId)));
    const studentRows =
      studentIds.length > 0
        ? await db
            .select({ id: users.id, name: users.name, email: users.email })
            .from(users)
            .where(
              sql`${users.id} IN (${sql.join(
                studentIds.map((id: any) => sql`${id}`),
                sql`, `,
              )})`,
            )
        : [];

    const nameById = new Map<string, any>(
      studentRows.map((s: any) => [s.id, s]),
    );
    const assignmentTitle = new Map<string, string>(
      classAssignments.map((a: any) => [a.id, a.title]),
    );

    res.json(
      submissions.map((s: any) => {
        const student = nameById.get(s.studentId) || {};
        return {
          id: s.id,
          assignmentId: s.assignmentId,
          assignmentTitle: assignmentTitle.get(s.assignmentId) || "",
          studentId: s.studentId,
          studentName: student.name || "Unknown",
          studentEmail: student.email || "",
          status: s.status,
          score: s.score,
          submissionComment: s.submissionComment,
          submissionContent: (s as any).submissionContent || s.submissionComment,
          submissionFileName: s.submissionFileName,
          hasSubmissionFile: !!s.submissionFileName,
          feedback: s.feedback,
          gradedAt: s.gradedAt,
          submittedAt: s.completedAt,
        };
      }),
    );
  } catch (err) {
    console.error("Fetch submissions error:", err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// Single assignment submissions for teacher grading
router.get(
  "/:assignmentId/submissions",
  requireRole(["TEACHER", "SUPER_ADMIN"]),
  async (req: any, res) => {
    try {
      const { assignmentId } = req.params;
      const assignment = await loadAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: "Bài tập không tồn tại" });
      }
      if (
        req.user.role === "TEACHER" &&
        assignment.teacherId !== req.user.userId
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const submissions = await db
        .select({
          id: studentAssignments.id,
          assignmentId: studentAssignments.assignmentId,
          studentId: studentAssignments.studentId,
          status: studentAssignments.status,
          score: studentAssignments.score,
          submissionComment: studentAssignments.submissionComment,
          submissionContent: studentAssignments.submissionContent,
          submissionFileName: studentAssignments.submissionFileName,
          feedback: studentAssignments.feedback,
          gradedAt: studentAssignments.gradedAt,
          completedAt: studentAssignments.completedAt,
          submittedAt: studentAssignments.submittedAt,
        })
        .from(studentAssignments)
        .where(eq(studentAssignments.assignmentId, assignmentId));

      const studentIds = Array.from(
        new Set(submissions.map((s: any) => s.studentId)),
      );
      const studentRows =
        studentIds.length > 0
          ? await db
              .select({ id: users.id, name: users.name, email: users.email })
              .from(users)
              .where(
                sql`${users.id} IN (${sql.join(
                  studentIds.map((sid: any) => sql`${sid}`),
                  sql`, `,
                )})`,
              )
          : [];
      const studentMap = new Map<string, any>(
        studentRows.map((s: any) => [s.id, s]),
      );

      res.json(
        submissions.map((s: any) => ({
          ...s,
          studentName: studentMap.get(s.studentId)?.name || "Unknown",
          studentEmail: studentMap.get(s.studentId)?.email || "",
          hasSubmissionFile: !!s.submissionFileName,
        })),
      );
    } catch (err) {
      console.error("Fetch single assignment submissions error:", err);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  },
);

// Student submits work for an assignment (text + optional file)
router.post("/:assignmentId/submit", async (req: any, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.userId;
    const { comment, submissionContent, file } = req.body ?? {};
    const textContent = submissionContent || comment || null;

    const assignment = await loadAssignment(assignmentId);
    if (!assignment)
      return res.status(404).json({ error: "Bài tập không tồn tại" });

    if (!(await isEnrolled(studentId, assignment.classId))) {
      return res
        .status(403)
        .json({ error: "Bạn không thuộc lớp học của bài tập này" });
    }

    const existing = await db
      .select()
      .from(studentAssignments)
      .where(
        and(
          eq(studentAssignments.assignmentId, assignmentId),
          eq(studentAssignments.studentId, studentId),
        ),
      )
      .limit(1);

    const existingRow = existing[0] || null;
    if (existingRow?.status === "GRADED") {
      return res.status(400).json({
        error: "Bài tập đã được chấm điểm, không thể nộp lại",
      });
    }

    const studentAssignmentId = existingRow?.id || uuidv4();

    // Optional submitted file (base64)
    let submissionFileKey: string | null = null;
    let submissionFileName: string | null = null;
    if (file?.data && file?.filename) {
      const buffer = Buffer.from(file.data, "base64");
      submissionFileName = file.filename;
      submissionFileKey = `submission-files/${studentAssignmentId}/${sanitizeFilename(file.filename)}`;
      await storageProvider.upload(submissionFileKey, buffer, {
        filename: file.filename,
        mimeType: file.mimeType || "application/octet-stream",
        size: buffer.length,
      });
    }

    if (existingRow) {
      await db
        .update(studentAssignments)
        .set({
          status: "SUBMITTED",
          submissionComment: textContent,
          submissionContent: textContent,
          submissionFileKey,
          submissionFileName,
          startedAt: existingRow.startedAt || new Date(),
          completedAt: new Date(),
          submittedAt: new Date(),
        })
        .where(eq(studentAssignments.id, existingRow.id));
    } else {
      await db.insert(studentAssignments).values({
        id: studentAssignmentId,
        assignmentId,
        studentId,
        status: "SUBMITTED",
        submissionComment: textContent,
        submissionContent: textContent,
        submissionFileKey,
        submissionFileName,
        startedAt: new Date(),
        completedAt: new Date(),
        submittedAt: new Date(),
      });
    }

    // Notify the teacher that a student submitted work
    const student = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, studentId))
      .limit(1);
    await db.insert(notifications).values({
      id: uuidv4(),
      userId: assignment.teacherId,
      type: "SUBMISSION",
      title: "Học sinh nộp bài",
      message: `${student[0]?.name || "Học sinh"} đã nộp bài "${assignment.title}"`,
      resourceType: "ASSIGNMENT",
      resourceId: assignmentId,
      createdAt: new Date(),
    });

    res.json({ success: true, status: "SUBMITTED" });
  } catch (err) {
    console.error("Submit assignment error:", err);
    res.status(500).json({ error: "Không thể nộp bài lúc này" });
  }
});

// Download the file the teacher attached to an assignment
router.get("/:assignmentId/file", async (req: any, res) => {
  try {
    const assignment = await loadAssignment(req.params.assignmentId);
    if (!assignment || !assignment.attachFileKey)
      return res.status(404).json({ error: "File không tồn tại" });

    const isTeacherOwner =
      req.user.role === "TEACHER" && assignment.teacherId === req.user.userId;
    const isStudent = await isEnrolled(req.user.userId, assignment.classId);
    if (req.user.role !== "SUPER_ADMIN" && !isTeacherOwner && !isStudent) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const buffer = await storageProvider.download(assignment.attachFileKey);
    const metadata = await storageProvider.getMetadata(assignment.attachFileKey);
    res.setHeader("Content-Type", metadata?.mimeType || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      contentDisposition(assignment.attachFileName || assignment.title),
    );
    res.send(buffer);
  } catch (err) {
    console.error("Download assignment file error:", err);
    res.status(404).json({ error: "File không tồn tại" });
  }
});

// Teacher grades a student's submission
router.post(
  "/student-submissions/:studentAssignmentId/grade",
  requireRole(["TEACHER", "SUPER_ADMIN"]),
  async (req: any, res) => {
    try {
      const { studentAssignmentId } = req.params;
      const { score, feedback } = req.body ?? {};

      if (score == null || Number.isNaN(Number(score))) {
        return res.status(400).json({ error: "Cần nhập điểm số" });
      }
      const numericScore = Math.max(0, Math.min(100, Number(score)));

      const row = await db
        .select()
        .from(studentAssignments)
        .where(eq(studentAssignments.id, studentAssignmentId))
        .limit(1);
      if (row.length === 0)
        return res.status(404).json({ error: "Bài nộp không tồn tại" });
      const submission = row[0];

      if (req.user.role === "TEACHER") {
        const assignment = await loadAssignment(submission.assignmentId);
        if (!assignment || assignment.teacherId !== req.user.userId) {
          return res
            .status(403)
            .json({ error: "Bạn không sở hữu bài tập này" });
        }
      }

      await db
        .update(studentAssignments)
        .set({
          status: "GRADED",
          score: numericScore,
          feedback: feedback || null,
          gradedAt: new Date(),
        })
        .where(eq(studentAssignments.id, studentAssignmentId));

      const assignment = await loadAssignment(submission.assignmentId);
      await db.insert(notifications).values({
        id: uuidv4(),
        userId: submission.studentId,
        type: "GRADE",
        title: "Bài tập đã được chấm điểm",
        message: `Bài "${assignment?.title || "của bạn"}" được chấm: ${numericScore}/100 điểm${
          feedback ? ` — ${feedback}` : ""
        }`,
        resourceType: "ASSIGNMENT",
        resourceId: submission.assignmentId,
        createdAt: new Date(),
      });

      res.json({ success: true, score: numericScore, feedback: feedback || null });
    } catch (err) {
      console.error("Grade assignment error:", err);
      res.status(500).json({ error: "Không thể chấm điểm lúc này" });
    }
  },
);

// Alias: POST /:assignmentId/submissions/:studentId/grade
router.post(
  "/:assignmentId/submissions/:studentId/grade",
  requireRole(["TEACHER", "SUPER_ADMIN"]),
  async (req: any, res) => {
    try {
      const { assignmentId, studentId } = req.params;
      const { score, feedback } = req.body ?? {};

      if (score == null || Number.isNaN(Number(score))) {
        return res.status(400).json({ error: "Cần nhập điểm số" });
      }
      const numericScore = Math.max(0, Math.min(100, Number(score)));

      const assignment = await loadAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: "Bài tập không tồn tại" });
      }
      if (
        req.user.role === "TEACHER" &&
        assignment.teacherId !== req.user.userId
      ) {
        return res.status(403).json({ error: "Bạn không sở hữu bài tập này" });
      }

      const rows = await db
        .select()
        .from(studentAssignments)
        .where(
          and(
            eq(studentAssignments.assignmentId, assignmentId),
            eq(studentAssignments.studentId, studentId),
          ),
        )
        .limit(1);

      if (rows.length === 0) {
        return res.status(404).json({ error: "Bài nộp không tồn tại" });
      }

      const submission = rows[0];
      await db
        .update(studentAssignments)
        .set({
          status: "GRADED",
          score: numericScore,
          feedback: feedback || null,
          gradedAt: new Date(),
        })
        .where(eq(studentAssignments.id, submission.id));

      await db.insert(notifications).values({
        id: uuidv4(),
        userId: studentId,
        type: "GRADE",
        title: "Bài tập đã được chấm điểm",
        message: `Bài "${assignment.title}" được chấm: ${numericScore}/100 điểm${
          feedback ? ` — ${feedback}` : ""
        }`,
        resourceType: "ASSIGNMENT",
        resourceId: assignmentId,
        createdAt: new Date(),
      });

      res.json({
        success: true,
        score: numericScore,
        feedback: feedback || null,
      });
    } catch (err) {
      console.error("Grade submission error:", err);
      res.status(500).json({ error: "Không thể chấm điểm lúc này" });
    }
  },
);

// Download a student's submitted file (student owner or grading teacher)
router.get("/student-submissions/:studentAssignmentId/file", async (req: any, res) => {
  try {
    const { studentAssignmentId } = req.params;
    const row = await db
      .select()
      .from(studentAssignments)
      .where(eq(studentAssignments.id, studentAssignmentId))
      .limit(1);
    if (row.length === 0 || !row[0].submissionFileKey)
      return res.status(404).json({ error: "File không tồn tại" });
    const submission = row[0];
    const assignment = await loadAssignment(submission.assignmentId);

    const isOwner = req.user.userId === submission.studentId;
    const isTeacherOwner =
      req.user.role === "TEACHER" && assignment?.teacherId === req.user.userId;
    if (req.user.role !== "SUPER_ADMIN" && !isOwner && !isTeacherOwner) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const buffer = await storageProvider.download(submission.submissionFileKey);
    const metadata = await storageProvider.getMetadata(submission.submissionFileKey);
    res.setHeader(
      "Content-Type",
      metadata?.mimeType || "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      contentDisposition(submission.submissionFileName || "bai-nop"),
    );
    res.send(buffer);
  } catch (err) {
    console.error("Download submission file error:", err);
    res.status(404).json({ error: "File không tồn tại" });
  }
});

// Get assignments for student (including assignments without a submission row yet)
router.get("/my", async (req: any, res) => {
  try {
    const studentId = req.user.userId;

    const myEnrollments = await db
      .select({ classId: enrollments.classId })
      .from(enrollments)
      .where(eq(enrollments.studentId, studentId));
    const classIds = myEnrollments.map((e: any) => e.classId);
    if (classIds.length === 0) return res.json([]);

    const classAssignments = await db
      .select()
      .from(assignments)
      .where(
        sql`${assignments.classId} IN (${sql.join(
          classIds.map((id: any) => sql`${id}`),
          sql`, `,
        )})`,
      );

    const mySubmissions = await db
      .select()
      .from(studentAssignments)
      .where(eq(studentAssignments.studentId, studentId));
    const submissionByAssignment = new Map<string, any>(
      mySubmissions.map((s: any) => [s.assignmentId, s]),
    );

    const classRows = classIds.length
      ? await db
          .select({ id: classes.id, name: classes.name })
          .from(classes)
          .where(
            sql`${classes.id} IN (${sql.join(
              classIds.map((id: any) => sql`${id}`),
              sql`, `,
            )})`,
          )
      : [];
    const className = new Map<string, string>(
      classRows.map((c: any) => [c.id, c.name]),
    );

    const teacherIds = Array.from(
      new Set(classAssignments.map((a: any) => a.teacherId)),
    );
    const teacherRows =
      teacherIds.length > 0
        ? await db
            .select({ id: users.id, name: users.name })
            .from(users)
            .where(
              sql`${users.id} IN (${sql.join(
                teacherIds.map((id: any) => sql`${id}`),
                sql`, `,
              )})`,
            )
        : [];
    const teacherName = new Map<string, string>(
      teacherRows.map((t: any) => [t.id, t.name]),
    );

    res.json(
      classAssignments.map((a: any) => {
        const sub = submissionByAssignment.get(a.id);
        return {
          id: sub?.id || "",
          assignmentId: a.id,
          title: a.title,
          type: a.type,
          description: a.description || "",
          lessonId: a.lessonId,
          exerciseId: a.exerciseId,
          dueDate: a.dueDate,
          hasAttachment: !!a.attachFileKey,
          attachFileName: a.attachFileName || "",
          status: sub?.status || "NOT_STARTED",
          score: sub?.score ?? null,
          submissionComment: sub?.submissionComment || "",
          submissionFileName: sub?.submissionFileName || "",
          feedback: sub?.feedback || "",
          gradedAt: sub?.gradedAt || null,
          className: className.get(a.classId) || "",
          teacherName: teacherName.get(a.teacherId) || "",
        };
      }),
    );
  } catch (err) {
    console.error("Fetch my assignments error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete assignment (teacher)
router.delete(
  "/:assignmentId",
  requireRole(["TEACHER", "SUPER_ADMIN"]),
  async (req: any, res) => {
    try {
      const assignment = await db
        .select()
        .from(assignments)
        .where(eq(assignments.id, req.params.assignmentId))
        .limit(1);
      if (assignment.length === 0)
        return res.status(404).json({ error: "Assignment not found" });
      if (
        req.user.role === "TEACHER" &&
        assignment[0].teacherId !== req.user.userId
      ) {
        return res.status(403).json({ error: "You do not own this assignment" });
      }
      if (assignment[0].attachFileKey) {
        await storageProvider.delete(assignment[0].attachFileKey).catch(() => {});
      }
      await db
        .delete(studentAssignments)
        .where(eq(studentAssignments.assignmentId, req.params.assignmentId));
      await db
        .delete(notifications)
        .where(
          and(
            eq(notifications.resourceType, "ASSIGNMENT"),
            eq(notifications.resourceId, req.params.assignmentId),
          ),
        );
      await db
        .delete(assignments)
        .where(eq(assignments.id, req.params.assignmentId));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete assignment" });
    }
  },
);

export const assignmentsRouter = router;