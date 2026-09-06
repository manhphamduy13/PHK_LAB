import { db } from '../../db';
import { xpTransactions, learnerProfiles, studentAchievements, achievements } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export class GamificationEngine {
    
    // Calculates level based on simple curve
    static calculateLevel(xp: number): { level: number, currentLevelXp: number, nextLevelXp: number, progress: number } {
        // level = floor(sqrt(xp / 100)) + 1
        // xp for level = (level - 1)^2 * 100
        const level = Math.floor(Math.sqrt(xp / 100)) + 1;
        const currentLevelTotalXp = Math.pow(level - 1, 2) * 100;
        const nextLevelTotalXp = Math.pow(level, 2) * 100;
        
        const currentLevelXp = xp - currentLevelTotalXp;
        const nextLevelRequired = nextLevelTotalXp - currentLevelTotalXp;
        const progress = Math.round((currentLevelXp / nextLevelRequired) * 100);
        
        return { level, currentLevelXp, nextLevelXp: nextLevelRequired, progress };
    }

    static async awardXP(studentId: string, action: string, sourceType: string, sourceId: string, amount: number) {
        // Anti-abuse: check if already awarded for this specific logical action/sourceId
        const existing = await db.select().from(xpTransactions).where(
            sql`${xpTransactions.studentId} = ${studentId} AND ${xpTransactions.action} = ${action} AND ${xpTransactions.sourceId} = ${sourceId}`
        );

        if (existing.length > 0 && sourceId) {
            console.log(`XP already awarded for ${action} on ${sourceId}`);
            return false;
        }

        // Insert Transaction
        await db.insert(xpTransactions).values({
            id: uuidv4(),
            studentId,
            action,
            sourceType,
            sourceId,
            xp: amount,
            timestamp: new Date()
        });

        // Update Profile
        const profile = await db.select().from(learnerProfiles).where(eq(learnerProfiles.studentId, studentId));
        if (profile.length > 0) {
            const currentTotal = profile[0].totalXp || 0;
            const newTotal = currentTotal + amount;
            
            await db.update(learnerProfiles)
                .set({ totalXp: newTotal, lastActiveAt: new Date() })
                .where(eq(learnerProfiles.studentId, studentId));
                
            await this.updateStreak(studentId);
            return true;
        } else {
            await db.insert(learnerProfiles).values({
                id: uuidv4(),
                studentId,
                totalXp: amount,
                learningStreak: 1,
                lastActiveAt: new Date(),
                grade: 10,
            });
            return true;
        }
    }
    
    static async updateStreak(studentId: string) {
        const profile = await db.select().from(learnerProfiles).where(eq(learnerProfiles.studentId, studentId));
        if (profile.length > 0) {
            const lastActive = profile[0].lastActiveAt;
            const now = new Date();
            let newStreak = profile[0].learningStreak || 0;
            
            if (lastActive) {
                const diffTime = Math.abs(now.getTime() - lastActive.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                if (diffDays === 1) {
                    newStreak += 1;
                } else if (diffDays > 1) {
                    newStreak = 1; // reset streak
                } // diffDays == 0 (same day), do nothing to streak
            } else {
                newStreak = 1;
            }
            
            await db.update(learnerProfiles)
                .set({ learningStreak: newStreak, lastActiveAt: now })
                .where(eq(learnerProfiles.studentId, studentId));
        }
    }
}
