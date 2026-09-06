import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull();
const time = (name: string) =>
  timestamp(name, { withTimezone: true }).notNull();

export const roles = pgTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  roleId: text("role_id")
    .notNull()
    .references(() => roles.id),
  createdAt: createdAt(),
});
export const subjects = pgTable("subjects", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});
export const grades = pgTable("grades", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});
export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  teacherId: text("teacher_id")
    .notNull()
    .references(() => users.id),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id),
  gradeId: text("grade_id")
    .notNull()
    .references(() => grades.id),
});
export const chapters = pgTable("chapters", {
  id: text("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id),
  title: text("title").notNull(),
  order: integer("order").notNull(),
});
export const lessons = pgTable("lessons", {
  id: text("id").primaryKey(),
  chapterId: text("chapter_id")
    .notNull()
    .references(() => chapters.id),
  title: text("title").notNull(),
  content: text("content"),
  order: integer("order").notNull(),
  status: text("status").default("DRAFT"),
  sourceDocumentId: text("source_document_id").references(() => documents.id),
});
export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  path: text("path").notNull(),
  createdAt: createdAt(),
});
export const aiJobs = pgTable("ai_jobs", {
  id: text("id").primaryKey(),
  documentId: text("document_id").references(() => documents.id),
  lessonId: text("lesson_id").references(() => lessons.id),
  task: text("task").notNull(),
  status: text("status").notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  processingTimeMs: integer("processing_time_ms"),
  error: text("error"),
  retryCount: integer("retry_count").default(0),
  resultData: text("result_data"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
export const experiments = pgTable("experiments", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id").references(() => lessons.id),
  title: text("title").notNull(),
  description: text("description"),
  config: text("config"),
});
export const exercises = pgTable("exercises", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id").references(() => lessons.id),
  title: text("title").notNull(),
  type: text("type").default("TRẮC NGHIỆM"),
  difficulty: text("difficulty").default("MEDIUM"),
  conceptId: text("concept_id"),
});
export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id),
  content: text("content").notNull(),
  type: text("type").notNull(),
});
export const answers = pgTable("answers", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id),
  content: text("content").notNull(),
  isCorrect: boolean("is_correct").notNull(),
});
export const progress = pgTable("progress", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id),
  status: text("status").notNull(),
  score: integer("score"),
  updatedAt: updatedAt(),
});
export const achievements = pgTable("achievements", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
});
export const studentAchievements = pgTable("student_achievements", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  achievementId: text("achievement_id")
    .notNull()
    .references(() => achievements.id),
  unlockedAt: time("unlocked_at"),
});
export const learnerProfiles = pgTable("learner_profiles", {
  studentId: text("student_id")
    .primaryKey()
    .references(() => users.id),
  grade: integer("grade"),
  preferredDifficulty: text("preferred_difficulty").default("medium"),
  learningStreak: integer("learning_streak").default(0),
  totalXp: integer("total_xp").default(0),
  weakConcepts: text("weak_concepts"),
  strongConcepts: text("strong_concepts"),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
});
export const conceptMastery = pgTable("concept_mastery", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => users.id),
  conceptId: text("concept_id").notNull(),
  masteryScore: integer("mastery_score").notNull().default(0),
  status: text("status").notNull().default("NOT_STARTED"),
  updatedAt: updatedAt(),
});
export const learningEvents = pgTable("learning_events", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => users.id),
  eventType: text("event_type").notNull(),
  resourceId: text("resource_id"),
  conceptId: text("concept_id"),
  metadata: text("metadata"),
  timestamp: time("timestamp"),
});
export const flashcards = pgTable("flashcards", {
  id: text("id").primaryKey(),
  conceptId: text("concept_id"),
  lessonId: text("lesson_id"),
  front: text("front").notNull(),
  back: text("back").notNull(),
  type: text("type").default("Definition"),
});
export const flashcardReviews = pgTable("flashcard_reviews", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => users.id),
  flashcardId: text("flashcard_id")
    .notNull()
    .references(() => flashcards.id),
  ease: integer("ease").notNull().default(250),
  interval: integer("interval").notNull().default(0),
  dueDate: time("due_date"),
  reviewCount: integer("review_count").notNull().default(0),
  successCount: integer("success_count").notNull().default(0),
  failureCount: integer("failure_count").notNull().default(0),
});
export const aiConversations = pgTable("ai_conversations", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => users.id),
  lessonId: text("lesson_id"),
  status: text("status").default("ACTIVE"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
export const aiMessages = pgTable("ai_messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => aiConversations.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"),
  timestamp: time("timestamp"),
});
export const recommendations = pgTable("recommendations", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(),
  resourceId: text("resource_id").notNull(),
  reason: text("reason"),
  status: text("status").default("PENDING"),
  createdAt: createdAt(),
});
export const teacherAiConversations = pgTable("teacher_ai_conversations", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id")
    .notNull()
    .references(() => users.id),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
export const teacherAiMessages = pgTable("teacher_ai_messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => teacherAiConversations.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"),
  timestamp: time("timestamp"),
});
export const examPlans = pgTable("exam_plans", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => users.id),
  examDate: time("exam_date"),
  subject: text("subject").notNull(),
  targetScore: integer("target_score"),
  readinessScore: integer("readiness_score").default(0),
  createdAt: createdAt(),
});
export const mockExams = pgTable("mock_exams", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => users.id),
  examPlanId: text("exam_plan_id").references(() => examPlans.id),
  score: integer("score"),
  status: text("status").default("PENDING"),
  createdAt: createdAt(),
});
export const earlyWarningSignals = pgTable("early_warning_signals", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => users.id),
  riskLevel: text("risk_level").notNull(),
  riskScore: integer("risk_score").notNull(),
  reasons: text("reasons").notNull(),
  suggestedAction: text("suggested_action"),
  createdAt: createdAt(),
});
export const interventions = pgTable("interventions", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id")
    .notNull()
    .references(() => users.id),
  studentId: text("student_id")
    .notNull()
    .references(() => users.id),
  signalId: text("signal_id").references(() => earlyWarningSignals.id),
  type: text("type").notNull(),
  resourceId: text("resource_id"),
  status: text("status").default("ACTIVE"),
  createdAt: createdAt(),
});
export const classes = pgTable("classes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  joinCode: text("join_code"),
  teacherId: text("teacher_id")
    .notNull()
    .references(() => users.id),
  gradeId: text("grade_id").references(() => grades.id),
  createdAt: createdAt(),
});
export const enrollments = pgTable("enrollments", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => users.id),
  classId: text("class_id")
    .notNull()
    .references(() => classes.id),
  enrolledAt: time("enrolled_at"),
});
export const xpTransactions = pgTable("xp_transactions", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(),
  sourceType: text("source_type"),
  sourceId: text("source_id"),
  xp: integer("xp").notNull(),
  timestamp: time("timestamp"),
});
export const assignments = pgTable("assignments", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  teacherId: text("teacher_id")
    .notNull()
    .references(() => users.id),
  classId: text("class_id")
    .notNull()
    .references(() => classes.id),
  courseId: text("course_id").references(() => courses.id),
  lessonId: text("lesson_id").references(() => lessons.id),
  exerciseId: text("exercise_id").references(() => exercises.id),
  type: text("type").notNull(),
  startDate: time("start_date"),
  dueDate: time("due_date"),
  status: text("status").default("DRAFT"),
  attachFileKey: text("attach_file_key"),
  attachFileName: text("attach_file_name"),
  createdAt: createdAt(),
});
export const studentAssignments = pgTable("student_assignments", {
  id: text("id").primaryKey(),
  assignmentId: text("assignment_id")
    .notNull()
    .references(() => assignments.id),
  studentId: text("student_id")
    .notNull()
    .references(() => users.id),
  status: text("status").default("NOT_STARTED"),
  score: integer("score"),
  submissionComment: text("submission_comment"),
  submissionContent: text("submission_content"),
  submissionFileKey: text("submission_file_key"),
  submissionFileName: text("submission_file_name"),
  feedback: text("feedback"),
  gradedAt: timestamp("graded_at", { withTimezone: true }),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
});
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  resourceType: text("resource_type"),
  resourceId: text("resource_id"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").references(() => users.id),
  userId: text("user_id"),
  userName: text("user_name"),
  action: text("action").notNull(),
  resource: text("resource"),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  metadata: text("metadata"),
  createdAt: createdAt(),
});
