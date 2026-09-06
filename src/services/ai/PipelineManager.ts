import { db } from "../../db";
import { aiJobs, documents, lessons } from "../../db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { DocumentAnalyzer } from "./generators/DocumentAnalyzer";
import { ContentValidator } from "./validators/ContentValidator";
import { appConfig } from "../../config";
import { storageProvider } from "../storage";

export class PipelineManager {
  private static toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  static async reprocessDocument(documentId: string, ownerId?: string) {
    const source = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);
    if (source.length === 0) throw new Error("Document not found");
    const jobId = uuidv4();
    await db.insert(aiJobs).values({
      id: jobId,
      documentId,
      task: "FULL_PIPELINE",
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    PipelineManager.startPipeline(
      jobId,
      documentId,
      source[0].path,
      ownerId,
    ).catch(console.error);
    return { jobId };
  }

  static async startPipeline(
    jobId: string,
    documentId: string,
    storageKey: string,
    ownerId?: string,
  ) {
    try {
      await this.updateJobStatus(jobId, "PROCESSING");

      const pdfBuffer = await storageProvider.download(storageKey);
      if (pdfBuffer.length > appConfig.maxAiInputSize) {
        throw new Error("PDF exceeds the configured AI input limit");
      }
      const base64Data = pdfBuffer.toString("base64");

      const filePart = {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf",
        },
      };

      console.log(`[Job ${jobId}] Analyzing Document...`);
      const structuredData: any =
        await DocumentAnalyzer.extractKnowledge(filePart);
      const metadata = structuredData?.metadata || {};
      const concepts = Array.isArray(structuredData?.concepts)
        ? structuredData.concepts
        : [];
      const sections = Array.isArray(structuredData?.sections)
        ? structuredData.sections
        : [];
      const experiments = Array.isArray(structuredData?.experiments)
        ? structuredData.experiments
        : [];

      console.log(`[Job ${jobId}] Validating Physics Concepts...`);
      let validationResult: any = { isValid: true, issues: [] };
      try {
        validationResult =
          await ContentValidator.validatePhysicsConcepts(concepts);
        if (!validationResult?.isValid) {
          console.warn(
            `[Job ${jobId}] Physics validation flagged issues:`,
            validationResult.issues || [],
          );
        }
      } catch (validationError) {
        console.warn(
          `[Job ${jobId}] Physics validation skipped:`,
          this.toErrorMessage(validationError),
        );
      }

      console.log(`[Job ${jobId}] Generating Lesson...`);
      const lessonId = uuidv4();

      // Assume chapterId is known or create a dummy one for now.
      // In a full app, we'd pick the chapter. We'll use a hardcoded one or leave it empty?
      // The schema requires chapterId. Let's fetch the first chapter or create one.
      const { chapters, courses } = await import("../../db/schema");
      const ownedChapters = ownerId
        ? await db
            .select({ id: chapters.id })
            .from(chapters)
            .innerJoin(courses, eq(chapters.courseId, courses.id))
            .where(eq(courses.teacherId, ownerId))
            .limit(1)
        : [];
      const allChapters =
        ownedChapters.length > 0
          ? ownedChapters
          : await db.select().from(chapters).limit(1);
      let chapterId = allChapters.length > 0 ? allChapters[0].id : null;

      if (!chapterId) {
        // Create dummy course and chapter
        const { courses, subjects, grades, users, roles } =
          await import("../../db/schema");

        // we need a teacher
        const teachers = await db.select().from(users).limit(1);
        if (teachers.length === 0)
          throw new Error("No teacher found to assign course");

        // we need subject & grade
        const allSubjects = await db.select().from(subjects).limit(1);
        const allGrades = await db.select().from(grades).limit(1);
        if (allSubjects.length === 0 || allGrades.length === 0) {
          throw new Error(
            "Chưa có subject/grade mẫu. Hãy chạy seed database trước.",
          );
        }

        const courseId = uuidv4();
        await db.insert(courses).values({
          id: courseId,
          title: "AI Generated Course",
          teacherId: teachers[0].id,
          subjectId: allSubjects[0].id,
          gradeId: allGrades[0].id,
        });

        chapterId = uuidv4();
        await db.insert(chapters).values({
          id: chapterId,
          courseId: courseId,
          title: "Imported Content",
          order: 1,
        });
      }

      await db.insert(lessons).values({
        id: lessonId,
        chapterId: chapterId,
        title: metadata.title || "AI Generated Lesson",
        content: JSON.stringify({
          ...structuredData,
          metadata,
          concepts,
          sections,
          experiments,
        }),
        order: 1,
        status: "NEEDS_REVIEW",
        sourceDocumentId: documentId,
      });

      await this.updateJobStatus(
        jobId,
        "COMPLETED",
        JSON.stringify({ lessonId, structuredData }),
      );
      console.log(`[Job ${jobId}] Pipeline Completed!`);
    } catch (error: unknown) {
      console.error(`[Job ${jobId}] Pipeline Error:`, error);
      await this.updateJobStatus(
        jobId,
        "FAILED",
        undefined,
        this.toErrorMessage(error),
      );
    }
  }

  private static async updateJobStatus(
    jobId: string,
    status: string,
    resultData?: string,
    error?: string,
  ) {
    await db
      .update(aiJobs)
      .set({
        status,
        resultData,
        error,
        updatedAt: new Date(),
      })
      .where(eq(aiJobs.id, jobId));
  }
}
