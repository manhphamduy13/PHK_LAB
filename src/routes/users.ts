import express from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config";
import bcrypt from "bcryptjs";
import { requireRole } from "../middleware/auth";
import { AuditLogService } from "../services/AuditLogService";

const router = express.Router();
const JWT_SECRET = getJwtSecret();

const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  try {
    const decoded: any = jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

router.use(authMiddleware);
router.get("/me", async (req: any, res) => {
  const { users } = await import("../db/schema");
  const result = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, req.user.userId))
    .limit(1);
  res.json(result[0] || null);
});

router.post("/me/password", async (req: any, res) => {
  const { currentPassword, newPassword } = req.body;
  if (
    !currentPassword ||
    typeof newPassword !== "string" ||
    newPassword.length < 8
  )
    return res
      .status(400)
      .json({ error: "New password must contain at least 8 characters" });
  const { users } = await import("../db/schema");
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, req.user.userId))
    .limit(1);
  if (
    result.length === 0 ||
    !(await bcrypt.compare(currentPassword, result[0].password))
  )
    return res.status(400).json({ error: "Current password is incorrect" });
  await db
    .update(users)
    .set({ password: await bcrypt.hash(newPassword, 12) })
    .where(eq(users.id, req.user.userId));
  await AuditLogService.record(
    req.user.userId,
    "CHANGE_PASSWORD",
    "USER",
    req.user.userId,
  );
  res.json({ success: true });
});

router.get("/", async (req: any, res) => {
  try {
    const { users, roles, classes, enrollments } =
      await import("../db/schema");
    let allUsers: any[] = [];
    if (req.user.role === "SUPER_ADMIN") {
      allUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          roleName: roles.name,
          createdAt: users.createdAt,
        })
        .from(users)
        .leftJoin(roles, eq(users.roleId, roles.id));
    } else if (req.user.role === "TEACHER") {
      // Teachers only see students enrolled in their classes + themselves
      const myClasses = await db
        .select({ id: classes.id })
        .from(classes)
        .where(eq(classes.teacherId, req.user.userId));
      const classIds = myClasses.map((c: any) => c.id);
      let studentRows: any[] = [];
      if (classIds.length > 0) {
        const { sql } = await import("drizzle-orm");
        studentRows = await db
          .select({ studentId: enrollments.studentId })
          .from(enrollments)
          .where(
            sql`${enrollments.classId} IN (${sql.join(
              (classIds as any[]).map((id: any) => sql`${id}`),
              sql`, `,
            )})`,
          );
      }
      const studentIds = Array.from(
        new Set(studentRows.map((r: any) => r.studentId)),
      );
      if (studentIds.length > 0) {
        const { sql } = await import("drizzle-orm");
        const students = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            roleName: roles.name,
            createdAt: users.createdAt,
          })
          .from(users)
          .leftJoin(roles, eq(users.roleId, roles.id))
          .where(
            sql`${users.id} IN (${sql.join(
              (studentIds as any[]).map((id: any) => sql`${id}`),
              sql`, `,
            )})`,
          );
        allUsers = students;
      } else {
        allUsers = [];
      }
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }

    const mapped = allUsers.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.roleName,
      status: "ACTIVE",
      lastActive: new Date(u.createdAt).toLocaleDateString(),
      className: u.className || "",
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.delete("/:id", requireRole(["SUPER_ADMIN"]), async (req: any, res) => {
  try {
    const { users } = await import("../db/schema");
    if (req.params.id === req.user.userId)
      return res.status(400).json({ error: "You cannot delete yourself" });
    await db.delete(users).where(eq(users.id, req.params.id));
    await AuditLogService.record(
      req.user.userId,
      "DELETE",
      "USER",
      req.params.id,
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export const usersRouter = router;
