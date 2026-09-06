import express from "express";
import { desc, eq, like, or } from "drizzle-orm";
import { db } from "../db";
import { auditLogs } from "../db/schema";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = express.Router();
router.use(authMiddleware, requireRole(["TEACHER", "SUPER_ADMIN"]));

router.get("/", async (req: any, res) => {
  try {
    const { search, limit = 100 } = req.query;
    const parsedLimit = Math.min(Number(limit) || 100, 200);

    let query = db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(parsedLimit);

    // If teacher, only view their own logs
    if (req.user.role === "TEACHER") {
      const teacherLogs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.userId, req.user.userId))
        .orderBy(desc(auditLogs.createdAt))
        .limit(parsedLimit);
      
      if (search && typeof search === "string" && search.trim()) {
        const s = search.toLowerCase();
        return res.json(
          teacherLogs.filter(
            (log) =>
              log.action.toLowerCase().includes(s) ||
              (log.resource && log.resource.toLowerCase().includes(s)) ||
              (log.userName && log.userName.toLowerCase().includes(s)),
          ),
        );
      }
      return res.json(teacherLogs);
    }

    // Super Admin: can view all and search
    const allLogs = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(parsedLimit);

    if (search && typeof search === "string" && search.trim()) {
      const s = search.toLowerCase();
      return res.json(
        allLogs.filter(
          (log) =>
            log.action.toLowerCase().includes(s) ||
            (log.resource && log.resource.toLowerCase().includes(s)) ||
            (log.userName && log.userName.toLowerCase().includes(s)),
        ),
      );
    }

    res.json(allLogs);
  } catch (error) {
    console.error("Audit log query failed:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

export const auditLogsRouter = router;

