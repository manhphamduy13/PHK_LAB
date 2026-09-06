import { db } from "../db";
import { auditLogs } from "../db/schema";
import { v4 as uuidv4 } from "uuid";

export class AuditLogService {
  static async record(
    actorId: string | undefined,
    action: string,
    resourceType: string,
    resourceId?: string,
    metadata?: unknown,
  ) {
    await db.insert(auditLogs).values({
      id: uuidv4(),
      actorId: actorId || null,
      action,
      resourceType,
      resourceId: resourceId || null,
      metadata: metadata === undefined ? null : JSON.stringify(metadata),
      createdAt: new Date(),
    });
  }
}
