import express from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config";

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

router.get("/", async (req: any, res) => {
  try {
    const { users, roles } = await import("../db/schema");
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleName: roles.name,
      createdAt: users.createdAt
    }).from(users).leftJoin(roles, eq(users.roleId, roles.id));
    
    const mapped = allUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.roleName,
      status: 'ACTIVE',
      lastActive: new Date(u.createdAt).toLocaleDateString()
    }));
    
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const { users } = await import("../db/schema");
    await db.delete(users).where(eq(users.id, req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export const usersRouter = router;
