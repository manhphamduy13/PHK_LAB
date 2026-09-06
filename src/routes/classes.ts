import express from "express";
import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import {
  classes,
  enrollments,
  users,
  grades,
  learnerProfiles,
  progress,
  notifications,
} from "../db/schema";
import { v4 as uuidv4 } from "uuid";
import { logAudit } from "../services/audit/AuditLogger";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = express.Router();
router.use(authMiddleware);

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "PHK-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get teacher's classes (or all for SUPER_ADMIN)
router.get("/", async (req: any, res) => {
  try {
    if (req.user.role !== "TEACHER" && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const myClasses =
      req.user.role === "SUPER_ADMIN"
        ? await db.select().from(classes)
        : await db
            .select()
            .from(classes)
            .where(eq(classes.teacherId, req.user.userId));

    // Ensure all classes have a joinCode
    for (const c of myClasses) {
      if (!c.joinCode) {
        const newCode = generateJoinCode();
        c.joinCode = newCode;
        await db
          .update(classes)
          .set({ joinCode: newCode })
          .where(eq(classes.id, c.id));
      }
    }

    const gradeIdList = myClasses.map((c: any) => c.gradeId).filter(Boolean);
    const gradeRows =
      gradeIdList.length > 0
        ? await db
            .select({ id: grades.id, name: grades.name })
            .from(grades)
            .where(
              sql`${grades.id} IN (${sql.join(
                gradeIdList.map((id: any) => sql`${id}`),
                sql`, `,
              )})`,
            )
        : [];
    const gradeName = new Map(gradeRows.map((g: any) => [g.id, g.name]));

    const teacherIds = Array.from(
      new Set(myClasses.map((c: any) => c.teacherId)),
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
    const teacherName = new Map(teacherRows.map((t: any) => [t.id, t.name]));

    res.json(
      myClasses.map((c: any) => ({
        ...c,
        gradeName: gradeName.get(c.gradeId) || "",
        teacherName: teacherName.get(c.teacherId) || "",
      })),
    );
  } catch (err) {
    console.error("Get classes error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Student joins a class via joinCode
router.post("/join", requireRole(["STUDENT"]), async (req: any, res) => {
  try {
    const studentId = req.user.userId;
    const { joinCode } = req.body;

    if (!joinCode || typeof joinCode !== "string" || !joinCode.trim()) {
      return res.status(400).json({ error: "Vui lòng nhập mã lớp" });
    }

    const cleanCode = joinCode.trim().toUpperCase();
    const classRows = await db
      .select()
      .from(classes)
      .where(sql`UPPER(${classes.joinCode}) = ${cleanCode}`)
      .limit(1);

    if (classRows.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy lớp học với mã này" });
    }

    const targetClass = classRows[0];

    // Check if already enrolled
    const existing = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.studentId, studentId),
          eq(enrollments.classId, targetClass.id),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "Bạn đã tham gia lớp học này rồi" });
    }

    await db.insert(enrollments).values({
      id: uuidv4(),
      studentId,
      classId: targetClass.id,
      enrolledAt: new Date(),
    });

    // Notify student
    await db.insert(notifications).values({
      id: uuidv4(),
      userId: studentId,
      type: "CLASS_ENROLLED",
      title: "Đã tham gia lớp học",
      message: `Bạn đã tham gia thành công lớp: ${targetClass.name}`,
      resourceType: "CLASS",
      resourceId: targetClass.id,
      createdAt: new Date(),
    });

    // Audit log
    await logAudit(db, {
      userId: studentId,
      action: "JOIN_CLASS",
      resourceType: "CLASS",
      resourceId: targetClass.id,
      resource: targetClass.name,
      metadata: { joinCode: cleanCode },
    });

    res.json({
      success: true,
      message: `Đã tham gia lớp ${targetClass.name} thành công`,
      class: targetClass,
    });
  } catch (err) {
    console.error("Join class error:", err);
    res.status(500).json({ error: "Không thể tham gia lớp học" });
  }
});

// Student gets classes they are enrolled in
router.get("/my-enrolled", requireRole(["STUDENT"]), async (req: any, res) => {
  try {
    const studentId = req.user.userId;
    const enrolled = await db
      .select({
        id: classes.id,
        name: classes.name,
        joinCode: classes.joinCode,
        teacherId: classes.teacherId,
        enrolledAt: enrollments.enrolledAt,
        teacherName: users.name,
      })
      .from(enrollments)
      .innerJoin(classes, eq(enrollments.classId, classes.id))
      .leftJoin(users, eq(classes.teacherId, users.id))
      .where(eq(enrollments.studentId, studentId));

    res.json(enrolled);
  } catch (err) {
    console.error("My enrolled classes error:", err);
    res.status(500).json({ error: "Failed to load enrolled classes" });
  }
});

// Create class (teacher / admin)
router.post(
  "/",
  requireRole(["TEACHER", "SUPER_ADMIN"]),
  async (req: any, res) => {
    try {
      const teacherId = req.user.userId;
      const { name, gradeId } = req.body;
      if (!name?.trim()) {
        return res.status(400).json({ error: "Tên lớp không được để trống" });
      }

      const gradeRows = await db.select().from(grades);
      const selectedGrade = gradeId
        ? gradeRows.find((grade: any) => grade.id === gradeId)
        : gradeRows[0];
      if (!selectedGrade) {
        return res
          .status(400)
          .json({
            error: "Cần chọn khối lớp hoặc seed grades trước khi tạo lớp",
          });
      }

      const newClass = {
        id: uuidv4(),
        name: name.trim(),
        joinCode: generateJoinCode(),
        teacherId,
        gradeId: selectedGrade.id,
        createdAt: new Date(),
      };
      await db.insert(classes).values(newClass);

      await logAudit(db, {
        userId: teacherId,
        userName: req.user.name,
        action: "CREATE_CLASS",
        resourceType: "CLASS",
        resourceId: newClass.id,
        resource: newClass.name,
        metadata: { gradeId: selectedGrade.id, joinCode: newClass.joinCode },
      });

      res.json({ ...newClass, gradeName: selectedGrade.name });
    } catch (err) {
      console.error("Create class error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },
);

// Get students enrolled in a class with their XP and progress
router.get("/:classId/students", async (req: any, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.userId;

    const owned = await db
      .select()
      .from(classes)
      .where(and(eq(classes.id, classId), eq(classes.teacherId, teacherId)))
      .limit(1);

    if (req.user.role !== "SUPER_ADMIN" && owned.length === 0) {
      return res.status(403).json({ error: "You do not own this class" });
    }

    const enrolledStudents = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        enrolledAt: enrollments.enrolledAt,
        totalXp: learnerProfiles.totalXp,
        learningStreak: learnerProfiles.learningStreak,
        grade: learnerProfiles.grade,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .leftJoin(learnerProfiles, eq(users.id, learnerProfiles.studentId))
      .where(eq(enrollments.classId, classId));

    // Get completed lessons count for each student
    const result = await Promise.all(
      enrolledStudents.map(async (st: any) => {
        const completed = await db
          .select({ count: sql<number>`count(*)` })
          .from(progress)
          .where(
            and(
              eq(progress.userId, st.id),
              sql`LOWER(${progress.status}) = 'completed'`,
            ),
          );

        return {
          id: st.id,
          name: st.name,
          email: st.email,
          enrolledAt: st.enrolledAt,
          totalXp: st.totalXp || 0,
          learningStreak: st.learningStreak || 0,
          grade: st.grade || 10,
          lessonsCompleted: Number(completed[0]?.count || 0),
        };
      }),
    );

    res.json(result);
  } catch (err) {
    console.error("Get class students error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Teacher manually adds a student to class by email
router.post(
  "/:classId/students",
  requireRole(["TEACHER", "SUPER_ADMIN"]),
  async (req: any, res) => {
    try {
      const { classId } = req.params;
      const { email } = req.body;

      if (!email?.trim()) {
        return res
          .status(400)
          .json({ error: "Vui lòng cung cấp email học sinh" });
      }

      const owned = await db
        .select()
        .from(classes)
        .where(
          and(eq(classes.id, classId), eq(classes.teacherId, req.user.userId)),
        )
        .limit(1);
      if (req.user.role !== "SUPER_ADMIN" && owned.length === 0) {
        return res.status(403).json({ error: "You do not own this class" });
      }

      const studentRows = await db
        .select()
        .from(users)
        .where(eq(users.email, email.trim().toLowerCase()))
        .limit(1);

      if (studentRows.length === 0) {
        return res
          .status(404)
          .json({ error: "Không tìm thấy học sinh với email này" });
      }

      const student = studentRows[0];

      // Check if already in class
      const existing = await db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.classId, classId),
            eq(enrollments.studentId, student.id),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        return res
          .status(400)
          .json({ error: "Học sinh đã thuộc lớp này rồi" });
      }

      await db.insert(enrollments).values({
        id: uuidv4(),
        studentId: student.id,
        classId,
        enrolledAt: new Date(),
      });

      await logAudit(db, {
        userId: req.user.userId,
        userName: req.user.name,
        action: "ADD_STUDENT_TO_CLASS",
        resourceType: "CLASS",
        resourceId: classId,
        metadata: { studentId: student.id, studentEmail: student.email },
      });

      res.json({
        success: true,
        message: `Đã thêm học sinh ${student.name} vào lớp`,
        student: { id: student.id, name: student.name, email: student.email },
      });
    } catch (err) {
      console.error("Add student to class error:", err);
      res.status(500).json({ error: "Failed to add student" });
    }
  },
);

// Teacher removes a student from class
router.delete(
  "/:classId/students/:studentId",
  requireRole(["TEACHER", "SUPER_ADMIN"]),
  async (req: any, res) => {
    try {
      const { classId, studentId } = req.params;

      const owned = await db
        .select()
        .from(classes)
        .where(
          and(eq(classes.id, classId), eq(classes.teacherId, req.user.userId)),
        )
        .limit(1);
      if (req.user.role !== "SUPER_ADMIN" && owned.length === 0) {
        return res.status(403).json({ error: "You do not own this class" });
      }

      await db
        .delete(enrollments)
        .where(
          and(
            eq(enrollments.classId, classId),
            eq(enrollments.studentId, studentId),
          ),
        );

      await logAudit(db, {
        userId: req.user.userId,
        userName: req.user.name,
        action: "REMOVE_STUDENT_FROM_CLASS",
        resourceType: "CLASS",
        resourceId: classId,
        metadata: { studentId },
      });

      res.json({ success: true, message: "Đã gỡ học sinh khỏi lớp" });
    } catch (err) {
      console.error("Remove student error:", err);
      res.status(500).json({ error: "Failed to remove student" });
    }
  },
);

export const classesRouter = router;
