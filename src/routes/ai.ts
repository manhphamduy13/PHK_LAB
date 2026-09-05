import express from 'express';
import multer from 'multer';
import { db } from '../db';
import { documents, aiJobs, lessons } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { PipelineManager } from '../services/ai/PipelineManager';

const router = express.Router();

// Memory storage for uploads (in a real app, use S3 or disk storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // In a real application, save to disk or GCS/S3.
    // For this prototype, we'll store a dummy path and use the buffer directly in the pipeline,
    // or we could save it to disk. Let's just save to a temp folder to be safe.
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const filename = `${uuidv4()}-${file.originalname}`;
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, file.buffer);

    const docId = uuidv4();
    await db.insert(documents).values({
      id: docId,
      filename: filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: filePath,
      createdAt: new Date(),
    });

    // Create the initial AI Job
    const jobId = uuidv4();
    await db.insert(aiJobs).values({
      id: jobId,
      documentId: docId,
      task: 'FULL_PIPELINE',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Start pipeline in background
    PipelineManager.startPipeline(jobId, docId, filePath).catch(console.error);

    res.json({ documentId: docId, jobId: jobId, message: 'Upload successful, processing started.' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.get('/jobs', async (req, res) => {
  try {
    const jobs = await db.select().from(aiJobs);
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

router.get('/jobs/:id', async (req, res) => {
  try {
    const { eq } = await import('drizzle-orm');
    const jobs = await db.select().from(aiJobs).where(eq(aiJobs.id, req.params.id)).limit(1);
    if (jobs.length === 0) return res.status(404).json({ error: 'Job not found' });
    res.json({ job: jobs[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

router.get('/lessons/:id', async (req, res) => {
  try {
    const { eq } = await import('drizzle-orm');
    const lessonData = await db.select().from(lessons).where(eq(lessons.id, req.params.id)).limit(1);
    if (lessonData.length === 0) return res.status(404).json({ error: 'Lesson not found' });
    res.json({ lesson: lessonData[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

router.post('/lessons/:id/publish', async (req, res) => {
  try {
    const { eq } = await import('drizzle-orm');
    await db.update(lessons).set({ status: 'PUBLISHED' }).where(eq(lessons.id, req.params.id));
    res.json({ message: 'Lesson published successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish lesson' });
  }
});

export const aiRouter = router;
