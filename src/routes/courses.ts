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

// Specific lesson lookup must precede /:courseId, otherwise "lessons" is parsed as a course id.
router.get("/lessons/:lessonId", async (req: any, res) => {
  try {
    const { lessons } = await import("../db/schema");
    const [lesson] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, req.params.lessonId));
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    res.json(lesson);
  } catch {
    res.status(500).json({ error: "Failed to fetch lesson" });
  }
});

// Get all courses (with chapters and lessons count)
router.get("/", async (req: any, res) => {
  try {
    const { courses, chapters, lessons, grades, subjects } =
      await import("../db/schema");

    // We will do a simple join manually for the demo
    const allCourses = await db.select().from(courses);
    const allChapters = await db.select().from(chapters);
    const allLessons = await db.select().from(lessons);

    // This is not the most efficient way but works perfectly for a 30-user demo sqlite database
    const gradeRows = await db.select().from(grades);
    const subjectRows = await db.select().from(subjects);
    const mappedCourses = allCourses.map((c: any) => {
      const courseChapters = allChapters.filter(
        (ch: any) => ch.courseId === c.id,
      );
      const courseLessons = allLessons.filter((l: any) =>
        courseChapters.some((ch: any) => ch.id === l.chapterId),
      );

      return {
        ...c,
        grade:
          gradeRows.find((grade: any) => grade.id === c.gradeId)?.name ||
          "Chưa phân loại",
        subject:
          subjectRows.find((subject: any) => subject.id === c.subjectId)
            ?.name || "Chưa phân loại",
        status: courseLessons.some(
          (lesson: any) => lesson.status === "PUBLISHED",
        )
          ? "PUBLISHED"
          : "DRAFT",
        lessons: courseLessons.length,
        chapters: courseChapters.map((ch: any) => ({
          ...ch,
          lessons: allLessons.filter((l: any) => l.chapterId === ch.id),
        })),
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
    const { courses, chapters, lessons, grades, subjects } =
      await import("../db/schema");
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, req.params.courseId));
    if (!course) return res.status(404).json({ error: "Course not found" });

    const courseChapters = await db
      .select()
      .from(chapters)
      .where(eq(chapters.courseId, req.params.courseId));
    const allLessons = await db.select().from(lessons);

    const gradeRows = await db.select().from(grades);
    const subjectRows = await db.select().from(subjects);
    const fullCourse = {
      ...course,
      grade:
        gradeRows.find((grade: any) => grade.id === course.gradeId)?.name ||
        "Chưa phân loại",
      subject:
        subjectRows.find((subject: any) => subject.id === course.subjectId)
          ?.name || "Chưa phân loại",
      progress: 0,
      chapters: courseChapters.map((ch: any) => ({
        ...ch,
        lessons: allLessons
          .filter((l: any) => l.chapterId === ch.id)
          .map((l: any) => ({
            ...l,
            status: l.status === "COMPLETED" ? "completed" : "current",
          })),
      })),
    };
    res.json(fullCourse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch course" });
  }
});

router.post("/", async (req: any, res) => {
  try {
    const { courses, subjects, grades } = await import("../db/schema");
    const { title, subjectId, gradeId, description } = req.body;

    // We'll just hardcode subjectId and gradeId for the demo if not provided
    const subjectRows = await db.select().from(subjects);
    const gradeRows = await db.select().from(grades);
    const selectedSubject =
      subjectRows.find((item: any) => item.id === subjectId) || subjectRows[0];
    const selectedGrade =
      gradeRows.find((item: any) => item.id === gradeId) || gradeRows[0];
    if (!selectedSubject || !selectedGrade)
      return res
        .status(400)
        .json({ error: "Cần seed subjects và grades trước khi tạo khóa học" });
    const newCourse = {
      id: uuidv4(),
      title,
      description: description || "",
      teacherId: req.user.userId,
      subjectId: selectedSubject.id,
      gradeId: selectedGrade.id,
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
      content: "[]",
    };

    await db.insert(lessons).values(newLesson);
    res.json(newLesson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create lesson" });
  }
});

// Specific lesson routes must be registered before /:courseId.
router.get("/lessons/:lessonId", async (req: any, res) => {
  try {
    const { lessons } = await import("../db/schema");
    const [lesson] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, req.params.lessonId));
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lesson" });
  }
});

router.put("/lessons/:lessonId", async (req: any, res) => {
  try {
    const { lessons } = await import("../db/schema");
    await db
      .update(lessons)
      .set({
        title: req.body.title,
        content:
          req.body.content === undefined
            ? undefined
            : JSON.stringify(req.body.content),
        status: req.body.status,
      })
      .where(eq(lessons.id, req.params.lessonId));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update lesson" });
  }
});

router.put("/:courseId", async (req: any, res) => {
  try {
    const { courses } = await import("../db/schema");
    const { title } = req.body;
    await db
      .update(courses)
      .set({ title })
      .where(eq(courses.id, req.params.courseId));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update course" });
  }
});

router.delete("/chapters/:chapterId", async (req: any, res) => {
  try {
    const { chapters, lessons } = await import("../db/schema");
    await db.delete(lessons).where(eq(lessons.chapterId, req.params.chapterId));
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

router.delete("/:courseId", async (req: any, res) => {
  try {
    const { courses, chapters, lessons } = await import("../db/schema");
    const course = await db
      .select()
      .from(courses)
      .where(eq(courses.id, req.params.courseId))
      .limit(1);
    if (course.length === 0)
      return res.status(404).json({ error: "Course not found" });
    if (req.user.role === "TEACHER" && course[0].teacherId !== req.user.userId)
      return res.status(403).json({ error: "You do not own this course" });
    const courseChapters = await db
      .select()
      .from(chapters)
      .where(eq(chapters.courseId, req.params.courseId));
    for (const chapter of courseChapters)
      await db.delete(lessons).where(eq(lessons.chapterId, chapter.id));
    await db.delete(chapters).where(eq(chapters.courseId, req.params.courseId));
    await db.delete(courses).where(eq(courses.id, req.params.courseId));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete course" });
  }
});

export const coursesRouter = router;
