import express from "express";
import multer from "multer";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { documents, aiJobs, lessons, chapters, courses } from "../db/schema";
import { v4 as uuidv4 } from "uuid";
import { PipelineManager } from "../services/ai/PipelineManager";
import { authMiddleware, requireRole } from "../middleware/auth";
import { appConfig } from "../config";
import { storageProvider } from "../services/storage";

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole(["SUPER_ADMIN", "TEACHER"]));

router.get("/config", (_req, res) => {
  res.json({
    maxPdfSize: appConfig.maxPdfSize,
    maxAiInputSize: appConfig.maxAiInputSize,
    aiProvider: process.env.AI_PROVIDER || "gemini",
  });
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: appConfig.maxPdfSize },
});

router.post("/upload-pdf", upload.single("file"), async (req: any, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const hasPdfSignature =
      file.buffer.subarray(0, 5).toString("ascii") === "%PDF-";
    const hasPdfExtension = file.originalname.toLowerCase().endsWith(".pdf");
    if (
      file.mimetype !== "application/pdf" ||
      !hasPdfExtension ||
      !hasPdfSignature
    ) {
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    const filename = `${uuidv4()}.pdf`;
    const storageKey = `pdf/${filename}`;
    await storageProvider.upload(storageKey, file.buffer, {
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });
    const docId = uuidv4();
    await db.insert(documents).values({
      id: docId,
      filename: filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: storageKey,
      createdAt: new Date(),
    });

    const jobId = uuidv4();
    await db.insert(aiJobs).values({
      id: jobId,
      documentId: docId,
      task: "FULL_PIPELINE",
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    PipelineManager.startPipeline(
      jobId,
      docId,
      storageKey,
      req.user.userId,
    ).catch(console.error);

    res.json({
      documentId: docId,
      jobId: jobId,
      message: "Upload successful, processing started.",
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

router.get("/jobs", async (req, res) => {
  try {
    const jobs = await db.select().from(aiJobs);
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

router.get("/jobs/:id", async (req, res) => {
  try {
    const { eq } = await import("drizzle-orm");
    const jobs = await db
      .select()
      .from(aiJobs)
      .where(eq(aiJobs.id, req.params.id))
      .limit(1);
    if (jobs.length === 0)
      return res.status(404).json({ error: "Job not found" });
    res.json({ job: jobs[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

router.post("/documents/:id/reprocess", async (req: any, res) => {
  try {
    const { documents } = await import("../db/schema");
    const document = await db
      .select()
      .from(documents)
      .where(eq(documents.id, req.params.id))
      .limit(1);
    if (document.length === 0)
      return res.status(404).json({ error: "Document not found" });
    const { PipelineManager } = await import("../services/ai/PipelineManager");
    const result = await PipelineManager.reprocessDocument(
      req.params.id,
      req.user.userId,
    );
    res.json(result);
  } catch (error) {
    console.error("Reprocess error:", error);
    res.status(500).json({ error: "Failed to reprocess document" });
  }
});

router.get("/lessons/:id", async (req, res) => {
  try {
    const { eq } = await import("drizzle-orm");
    const lessonData = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, req.params.id))
      .limit(1);
    if (lessonData.length === 0)
      return res.status(404).json({ error: "Lesson not found" });
    res.json({ lesson: lessonData[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lesson" });
  }
});

router.post("/lessons/:id/publish", async (req: any, res) => {
  try {
    const { and, eq } = await import("drizzle-orm");
    if (req.user.role === "TEACHER") {
      const ownedLesson = await db
        .select({ lessonId: lessons.id })
        .from(lessons)
        .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
        .innerJoin(courses, eq(chapters.courseId, courses.id))
        .where(
          and(
            eq(lessons.id, req.params.id),
            eq(courses.teacherId, req.user.userId),
          ),
        )
        .limit(1);
      if (ownedLesson.length === 0)
        return res.status(403).json({ error: "You do not own this lesson" });
    }
    await db
      .update(lessons)
      .set({ status: "PUBLISHED" })
      .where(eq(lessons.id, req.params.id));
    res.json({ message: "Lesson published successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to publish lesson" });
  }
});

router.get("/documents", async (req, res) => {
  try {
    const { documents } = await import("../db/schema");
    const docs = await db.select().from(documents);
    res.json(docs);
  } catch (error) {
    console.error("Failed to fetch documents", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

router.get("/documents/:id/download", async (req, res) => {
  try {
    const { documents } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.id, req.params.id))
      .limit(1);
    if (docs.length === 0) return res.status(404).json({ error: "Not found" });
    const doc = docs[0];
    const buffer = await storageProvider.download(doc.path);
    res.setHeader("Content-Type", doc.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${doc.originalName}"`,
    );
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: "Failed to download" });
  }
});

router.delete("/documents/:id", async (req, res) => {
  try {
    const { documents, aiJobs, lessons } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    await db
      .update(lessons)
      .set({ sourceDocumentId: null })
      .where(eq(lessons.sourceDocumentId, req.params.id));
    await db.delete(aiJobs).where(eq(aiJobs.documentId, req.params.id));
    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.id, req.params.id))
      .limit(1);
    if (docs.length > 0 && docs[0].path) {
      try {
        await storageProvider.delete(docs[0].path);
      } catch (storageError) {
        console.warn("Storage file already missing or invalid:", storageError);
      }
    }
    await db.delete(documents).where(eq(documents.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete document", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

export const aiRouter = router;
