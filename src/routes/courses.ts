import express from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config";
import { v4 as uuidv4 } from "uuid";

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

// Get all courses (with chapters and lessons count)
router.get("/", async (req: any, res) => {
  try {
    const { courses, chapters, lessons, grades, subjects } = await import("../db/schema");
    
    // We will do a simple join manually for the demo
    const allCourses = await db.select().from(courses);
    const allChapters = await db.select().from(chapters);
    const allLessons = await db.select().from(lessons);
    
    // This is not the most efficient way but works perfectly for a 30-user demo sqlite database
    const mappedCourses = allCourses.map((c: any) => {
      const courseChapters = allChapters.filter((ch: any) => ch.courseId === c.id);
      const courseLessons = allLessons.filter((l: any) => courseChapters.some((ch: any) => ch.id === l.chapterId));
      
      return {
        ...c,
        grade: "Lớp 10", // Mock mapping for now, ideally join with grades
        subject: "Vật Lý", // Mock mapping for now, ideally join with subjects
        status: "PUBLISHED", // Fallback
        lessons: courseLessons.length,
        chapters: courseChapters.map((ch: any) => ({
          ...ch,
          lessons: allLessons.filter((l: any) => l.chapterId === ch.id)
        }))
      };
    });
    
    res.json(mappedCourses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

router.get("/:courseId", async (req: any, res) => {
  try {
    const { courses, chapters, lessons } = await import("../db/schema");
    const [course] = await db.select().from(courses).where(eq(courses.id, req.params.courseId));
    if (!course) return res.status(404).json({ error: "Course not found" });

    const courseChapters = await db.select().from(chapters).where(eq(chapters.courseId, req.params.courseId));
    const allLessons = await db.select().from(lessons);

    const fullCourse = {
      ...course,
      grade: "Lớp 10",
      subject: "Vật Lý",
      progress: 0,
      chapters: courseChapters.map((ch: any) => ({
        ...ch,
        lessons: allLessons.filter((l: any) => l.chapterId === ch.id).map(l => ({...l, status: l.status === 'PUBLISHED' ? 'current' : 'locked'}))
      }))
    };
    res.json(fullCourse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch course" });
  }
});

router.post("/", async (req: any, res) => {
  try {
    const { courses } = await import("../db/schema");
    const { title, subjectId, gradeId, description } = req.body;
    
    // We'll just hardcode subjectId and gradeId for the demo if not provided
    const newCourse = {
      id: uuidv4(),
      title,
      description: description || "",
      teacherId: req.user.userId,
      subjectId: subjectId || "sub-physics", 
      gradeId: gradeId || "gr-10",
    };
    
    await db.insert(courses).values(newCourse);
    res.json(newCourse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create course" });
  }
});

router.post("/:courseId/chapters", async (req: any, res) => {
  try {
    const { chapters } = await import("../db/schema");
    const { title, order } = req.body;
    
    const newChapter = {
      id: uuidv4(),
      courseId: req.params.courseId,
      title,
      order: order || 1,
    };
    
    await db.insert(chapters).values(newChapter);
    res.json(newChapter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create chapter" });
  }
});

router.post("/chapters/:chapterId/lessons", async (req: any, res) => {
  try {
    const { lessons } = await import("../db/schema");
    const { title, order } = req.body;
    
    const newLesson = {
      id: uuidv4(),
      chapterId: req.params.chapterId,
      title,
      order: order || 1,
      status: "DRAFT",
      content: "[]"
    };
    
    await db.insert(lessons).values(newLesson);
    res.json(newLesson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create lesson" });
  }
});

router.get("/lessons/:lessonId", async (req: any, res) => {
  try {
    const { lessons } = await import("../db/schema");
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, req.params.lessonId));
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    res.json(lesson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch lesson" });
  }
});

router.put("/lessons/:lessonId", async (req: any, res) => {
  try {
    const { lessons } = await import("../db/schema");
    const { title, content, status } = req.body;
    
    await db.update(lessons)
      .set({ 
        title: title !== undefined ? title : undefined, 
        content: content !== undefined ? JSON.stringify(content) : undefined,
        status: status !== undefined ? status : undefined
      })
      .where(eq(lessons.id, req.params.lessonId));
      
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update lesson" });
  }
});

router.put("/:courseId", async (req: any, res) => {
  try {
    const { courses } = await import("../db/schema");
    const { title } = req.body;
    await db.update(courses).set({ title }).where(eq(courses.id, req.params.courseId));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update course" });
  }
});

router.delete("/:courseId", async (req: any, res) => {
  try {
    const { courses } = await import("../db/schema");
    await db.delete(courses).where(eq(courses.id, req.params.courseId));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete course" });
  }
});

router.delete("/chapters/:chapterId", async (req: any, res) => {
  try {
    const { chapters } = await import("../db/schema");
    await db.delete(chapters).where(eq(chapters.id, req.params.chapterId));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete chapter" });
  }
});

router.delete("/lessons/:lessonId", async (req: any, res) => {
  try {
    const { lessons } = await import("../db/schema");
    await db.delete(lessons).where(eq(lessons.id, req.params.lessonId));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete lesson" });
  }
});

export const coursesRouter = router;
