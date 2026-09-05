import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  roleId: text('role_id').notNull().references(() => roles.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const subjects = sqliteTable('subjects', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
});

export const grades = sqliteTable('grades', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
});

export const courses = sqliteTable('courses', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  teacherId: text('teacher_id').notNull().references(() => users.id),
  subjectId: text('subject_id').notNull().references(() => subjects.id),
  gradeId: text('grade_id').notNull().references(() => grades.id),
});

export const chapters = sqliteTable('chapters', {
  id: text('id').primaryKey(),
  courseId: text('course_id').notNull().references(() => courses.id),
  title: text('title').notNull(),
  order: integer('order').notNull(),
});

export const lessons = sqliteTable('lessons', {
  id: text('id').primaryKey(),
  chapterId: text('chapter_id').notNull().references(() => chapters.id),
  title: text('title').notNull(),
  content: text('content'),
  order: integer('order').notNull(),
  status: text('status').default('DRAFT'), // DRAFT, AI_GENERATED, NEEDS_REVIEW, REVIEWED, PUBLISHED, ARCHIVED
  version: integer('version').default(1),
  sourceDocumentId: text('source_document_id'), // optional ref to documents.id
});

export const lessonSections = sqliteTable('lesson_sections', {
  id: text('id').primaryKey(),
  lessonId: text('lesson_id').notNull().references(() => lessons.id),
  type: text('type').notNull(), // text, video, image, interactive
  content: text('content').notNull(),
  order: integer('order').notNull(),
});

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  hash: text('hash'),
  path: text('path').notNull(),
  uploadedBy: text('uploaded_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const aiJobs = sqliteTable('ai_jobs', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull().references(() => documents.id),
  model: text('model'),
  task: text('task'), // e.g. "ANALYZE", "EXTRACT", "GENERATE_LESSON", "FULL_PIPELINE"
  status: text('status').notNull(), // "PENDING", "PROCESSING", "COMPLETED", "FAILED"
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  processingTimeMs: integer('processing_time_ms'),
  error: text('error'),
  retryCount: integer('retry_count').default(0),
  resultData: text('result_data'), // JSON string of the result
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const experiments = sqliteTable('experiments', {
  id: text('id').primaryKey(),
  lessonId: text('lesson_id').references(() => lessons.id),
  title: text('title').notNull(),
  description: text('description'),
  config: text('config'), // JSON configuration for the experiment simulation
});

export const exercises = sqliteTable('exercises', {
  id: text('id').primaryKey(),
  lessonId: text('lesson_id').references(() => lessons.id),
  title: text('title').notNull(),
});

export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  exerciseId: text('exercise_id').notNull().references(() => exercises.id),
  content: text('content').notNull(),
  type: text('type').notNull(), // multiple_choice, essay, fill_blank
});

export const answers = sqliteTable('answers', {
  id: text('id').primaryKey(),
  questionId: text('question_id').notNull().references(() => questions.id),
  content: text('content').notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
});

export const progress = sqliteTable('progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  lessonId: text('lesson_id').notNull().references(() => lessons.id),
  status: text('status').notNull(), // in_progress, completed
  score: integer('score'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const achievements = sqliteTable('achievements', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
});

export const studentAchievements = sqliteTable('student_achievements', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  achievementId: text('achievement_id').notNull().references(() => achievements.id),
  unlockedAt: integer('unlocked_at', { mode: 'timestamp' }).notNull(),
});

export const learnerProfiles = sqliteTable('learner_profiles', {
  studentId: text('student_id').primaryKey().references(() => users.id),
  grade: integer('grade'),
  preferredDifficulty: text('preferred_difficulty').default('medium'),
  learningStreak: integer('learning_streak').default(0),
  totalXp: integer('total_xp').default(0),
  weakConcepts: text('weak_concepts'), // JSON array of concept IDs
  strongConcepts: text('strong_concepts'), // JSON array of concept IDs
  lastActiveAt: integer('last_active_at', { mode: 'timestamp' }),
});

export const conceptMastery = sqliteTable('concept_mastery', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => users.id),
  conceptId: text('concept_id').notNull(),
  masteryScore: integer('mastery_score').notNull().default(0),
  status: text('status').notNull().default('NOT_STARTED'), // NOT_STARTED, LEARNING, WEAK, DEVELOPING, MASTERED
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const learningEvents = sqliteTable('learning_events', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => users.id),
  eventType: text('event_type').notNull(),
  resourceId: text('resource_id'),
  conceptId: text('concept_id'),
  metadata: text('metadata'), // JSON string
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const flashcards = sqliteTable('flashcards', {
  id: text('id').primaryKey(),
  conceptId: text('concept_id'),
  lessonId: text('lesson_id'),
  front: text('front').notNull(),
  back: text('back').notNull(),
  type: text('type').default('Definition'),
});

export const flashcardReviews = sqliteTable('flashcard_reviews', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => users.id),
  flashcardId: text('flashcard_id').notNull().references(() => flashcards.id),
  ease: integer('ease').notNull().default(250),
  interval: integer('interval').notNull().default(0),
  dueDate: integer('due_date', { mode: 'timestamp' }).notNull(),
  reviewCount: integer('review_count').notNull().default(0),
  successCount: integer('success_count').notNull().default(0),
  failureCount: integer('failure_count').notNull().default(0),
});

export const aiConversations = sqliteTable('ai_conversations', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => users.id),
  lessonId: text('lesson_id'),
  status: text('status').default('ACTIVE'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const aiMessages = sqliteTable('ai_messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => aiConversations.id),
  role: text('role').notNull(), // user, assistant
  content: text('content').notNull(),
  metadata: text('metadata'), // JSON: mode, confidence, feedback, etc.
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const recommendations = sqliteTable('recommendations', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => users.id),
  type: text('type').notNull(), // LESSON, EXERCISE, SIMULATION, REVIEW, FLASHCARD
  resourceId: text('resource_id').notNull(),
  reason: text('reason'),
  status: text('status').default('PENDING'), // PENDING, CLICKED, DISMISSED, COMPLETED
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

