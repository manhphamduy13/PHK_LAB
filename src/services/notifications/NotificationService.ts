import { db } from '../../db';
import { notifications } from '../../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

export class NotificationService {
    static async notifyStudent(studentId: string, type: string, title: string, message: string, resourceType?: string, resourceId?: string) {
        await db.insert(notifications).values({
            id: uuidv4(),
            userId: studentId,
            type,
            title,
            message,
            resourceType,
            resourceId,
            createdAt: new Date()
        });
    }

    static async notifyTeacher(teacherId: string, type: string, title: string, message: string, resourceType?: string, resourceId?: string) {
        await db.insert(notifications).values({
            id: uuidv4(),
            userId: teacherId,
            type,
            title,
            message,
            resourceType,
            resourceId,
            createdAt: new Date()
        });
    }
}
