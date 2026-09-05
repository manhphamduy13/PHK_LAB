import { db } from '../../db';
import { aiJobs, lessons } from '../../db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { DocumentAnalyzer } from './generators/DocumentAnalyzer';
import { ContentValidator } from './validators/ContentValidator';

export class PipelineManager {
  static async startPipeline(jobId: string, documentId: string, filePath: string) {
    try {
      await this.updateJobStatus(jobId, 'PROCESSING');
      
      const pdfBuffer = await fs.readFile(filePath);
      const base64Data = pdfBuffer.toString('base64');
      
      const filePart = {
        inlineData: {
          data: base64Data,
          mimeType: 'application/pdf',
        },
      };

      console.log(`[Job ${jobId}] Analyzing Document...`);
      const structuredData: any = await DocumentAnalyzer.extractKnowledge(filePart);
      
      console.log(`[Job ${jobId}] Validating Physics Concepts...`);
      const validationResult: any = await ContentValidator.validatePhysicsConcepts(structuredData.concepts);

      if (!validationResult.isValid) {
         console.warn(`[Job ${jobId}] Physics validation flagged issues:`, validationResult.issues);
      }

      console.log(`[Job ${jobId}] Generating Lesson...`);
      const lessonId = uuidv4();
      
      // Assume chapterId is known or create a dummy one for now.
      // In a full app, we'd pick the chapter. We'll use a hardcoded one or leave it empty? 
      // The schema requires chapterId. Let's fetch the first chapter or create one.
      const { chapters } = await import('../../db/schema');
      const allChapters = await db.select().from(chapters).limit(1);
      let chapterId = allChapters.length > 0 ? allChapters[0].id : null;
      
      if (!chapterId) {
         // Create dummy course and chapter
         const { courses, subjects, grades, users, roles } = await import('../../db/schema');
         
         // we need a teacher
         const teachers = await db.select().from(users).limit(1);
         if(teachers.length === 0) throw new Error("No teacher found to assign course");
         
         // we need subject & grade
         const allSubjects = await db.select().from(subjects).limit(1);
         const allGrades = await db.select().from(grades).limit(1);
         
         const courseId = uuidv4();
         await db.insert(courses).values({
            id: courseId, title: 'AI Generated Course', teacherId: teachers[0].id, subjectId: allSubjects[0].id, gradeId: allGrades[0].id
         });
         
         chapterId = uuidv4();
         await db.insert(chapters).values({
            id: chapterId, courseId: courseId, title: 'Imported Content', order: 1
         });
      }

      await db.insert(lessons).values({
        id: lessonId,
        chapterId: chapterId,
        title: structuredData.metadata.title || "AI Generated Lesson",
        content: JSON.stringify(structuredData), // store raw data as content for now
        order: 1,
        status: 'NEEDS_REVIEW',
        sourceDocumentId: documentId,
      });

      await this.updateJobStatus(jobId, 'COMPLETED', JSON.stringify({ lessonId, structuredData }));
      console.log(`[Job ${jobId}] Pipeline Completed!`);
      
    } catch (error: any) {
      console.error(`[Job ${jobId}] Pipeline Error:`, error);
      await this.updateJobStatus(jobId, 'FAILED', undefined, error.message);
    }
  }

  private static async updateJobStatus(jobId: string, status: string, resultData?: string, error?: string) {
    await db.update(aiJobs)
      .set({ 
        status, 
        resultData, 
        error, 
        updatedAt: new Date() 
      })
      .where(eq(aiJobs.id, jobId));
  }
}
