import { db as defaultDb } from "../../db";
import { auditLogs, users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export interface AuditLogPayload {
  userId?: string;
  userName?: string;
  action: string;
  resource?: string;
  resourceType: string;
  resourceId?: string;
  metadata?: any;
}

export async function logAudit(
  database: any = defaultDb,
  payload: AuditLogPayload,
) {
  try {
    let userName = payload.userName;
    if (!userName && payload.userId) {
      const userRow = await database
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);
      if (userRow.length > 0) {
        userName = userRow[0].name;
      }
    }

    await database.insert(auditLogs).values({
      id: uuidv4(),
      actorId: payload.userId || null,
      userId: payload.userId || null,
      userName: userName || null,
      action: payload.action,
      resource: payload.resource || payload.resourceId || null,
      resourceType: payload.resourceType,
      resourceId: payload.resourceId || null,
      metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
