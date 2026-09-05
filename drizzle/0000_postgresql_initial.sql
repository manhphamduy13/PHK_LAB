-- PHK STEM LAB PostgreSQL baseline.
-- Apply with scripts/run-postgres-migration.mjs after setting DATABASE_URL.

CREATE TABLE IF NOT EXISTS roles (id text PRIMARY KEY, name text NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS users (id text PRIMARY KEY, email text NOT NULL UNIQUE, password text NOT NULL, name text NOT NULL, role_id text NOT NULL REFERENCES roles(id), created_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS subjects (id text PRIMARY KEY, name text NOT NULL UNIQUE, description text);
CREATE TABLE IF NOT EXISTS grades (id text PRIMARY KEY, name text NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS courses (id text PRIMARY KEY, title text NOT NULL, description text, teacher_id text NOT NULL REFERENCES users(id), subject_id text NOT NULL REFERENCES subjects(id), grade_id text NOT NULL REFERENCES grades(id));
CREATE TABLE IF NOT EXISTS chapters (id text PRIMARY KEY, course_id text NOT NULL REFERENCES courses(id), title text NOT NULL, "order" integer NOT NULL);
CREATE TABLE IF NOT EXISTS lessons (id text PRIMARY KEY, chapter_id text NOT NULL REFERENCES chapters(id), title text NOT NULL, content text, "order" integer NOT NULL, status text DEFAULT 'DRAFT');
CREATE TABLE IF NOT EXISTS documents (id text PRIMARY KEY, filename text NOT NULL, original_name text NOT NULL, mime_type text NOT NULL, size integer NOT NULL, path text NOT NULL, created_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS ai_jobs (id text PRIMARY KEY, document_id text REFERENCES documents(id), lesson_id text REFERENCES lessons(id), task text NOT NULL, status text NOT NULL, input_tokens integer, output_tokens integer, processing_time_ms integer, error text, retry_count integer DEFAULT 0, result_data text, created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS experiments (id text PRIMARY KEY, lesson_id text REFERENCES lessons(id), title text NOT NULL, description text, config text);
CREATE TABLE IF NOT EXISTS exercises (id text PRIMARY KEY, lesson_id text REFERENCES lessons(id), title text NOT NULL);
CREATE TABLE IF NOT EXISTS questions (id text PRIMARY KEY, exercise_id text NOT NULL REFERENCES exercises(id), content text NOT NULL, type text NOT NULL);
CREATE TABLE IF NOT EXISTS answers (id text PRIMARY KEY, question_id text NOT NULL REFERENCES questions(id), content text NOT NULL, is_correct boolean NOT NULL);
CREATE TABLE IF NOT EXISTS progress (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id), lesson_id text NOT NULL REFERENCES lessons(id), status text NOT NULL, score integer, updated_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS achievements (id text PRIMARY KEY, name text NOT NULL, description text, icon text);
CREATE TABLE IF NOT EXISTS student_achievements (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id), achievement_id text NOT NULL REFERENCES achievements(id), unlocked_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS learner_profiles (student_id text PRIMARY KEY REFERENCES users(id), grade integer, preferred_difficulty text DEFAULT 'medium', learning_streak integer DEFAULT 0, total_xp integer DEFAULT 0, weak_concepts text, strong_concepts text, last_active_at timestamptz);
CREATE TABLE IF NOT EXISTS concept_mastery (id text PRIMARY KEY, student_id text NOT NULL REFERENCES users(id), concept_id text NOT NULL, mastery_score integer NOT NULL DEFAULT 0, status text NOT NULL DEFAULT 'NOT_STARTED', updated_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS learning_events (id text PRIMARY KEY, student_id text NOT NULL REFERENCES users(id), event_type text NOT NULL, resource_id text, concept_id text, metadata text, "timestamp" timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS flashcards (id text PRIMARY KEY, concept_id text, lesson_id text, front text NOT NULL, back text NOT NULL, type text DEFAULT 'Definition');
CREATE TABLE IF NOT EXISTS flashcard_reviews (id text PRIMARY KEY, student_id text NOT NULL REFERENCES users(id), flashcard_id text NOT NULL REFERENCES flashcards(id), ease integer NOT NULL DEFAULT 250, interval integer NOT NULL DEFAULT 0, due_date timestamptz NOT NULL, review_count integer NOT NULL DEFAULT 0, success_count integer NOT NULL DEFAULT 0, failure_count integer NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS ai_conversations (id text PRIMARY KEY, student_id text NOT NULL REFERENCES users(id), lesson_id text, status text DEFAULT 'ACTIVE', created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS ai_messages (id text PRIMARY KEY, conversation_id text NOT NULL REFERENCES ai_conversations(id), role text NOT NULL, content text NOT NULL, metadata text, "timestamp" timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS recommendations (id text PRIMARY KEY, student_id text NOT NULL REFERENCES users(id), type text NOT NULL, resource_id text NOT NULL, reason text, status text DEFAULT 'PENDING', created_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS teacher_ai_conversations (id text PRIMARY KEY, teacher_id text NOT NULL REFERENCES users(id), created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS teacher_ai_messages (id text PRIMARY KEY, conversation_id text NOT NULL REFERENCES teacher_ai_conversations(id), role text NOT NULL, content text NOT NULL, metadata text, "timestamp" timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS exam_plans (id text PRIMARY KEY, student_id text NOT NULL REFERENCES users(id), exam_date timestamptz NOT NULL, subject text NOT NULL, target_score integer, readiness_score integer DEFAULT 0, created_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS mock_exams (id text PRIMARY KEY, student_id text NOT NULL REFERENCES users(id), exam_plan_id text REFERENCES exam_plans(id), score integer, status text DEFAULT 'PENDING', created_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS early_warning_signals (id text PRIMARY KEY, student_id text NOT NULL REFERENCES users(id), risk_level text NOT NULL, risk_score integer NOT NULL, reasons text NOT NULL, suggested_action text, created_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS interventions (id text PRIMARY KEY, teacher_id text NOT NULL REFERENCES users(id), student_id text NOT NULL REFERENCES users(id), signal_id text REFERENCES early_warning_signals(id), type text NOT NULL, resource_id text, status text DEFAULT 'ACTIVE', created_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS classes (id text PRIMARY KEY, name text NOT NULL, teacher_id text NOT NULL REFERENCES users(id), grade_id text REFERENCES grades(id), created_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS enrollments (id text PRIMARY KEY, student_id text NOT NULL REFERENCES users(id), class_id text NOT NULL REFERENCES classes(id), enrolled_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS xp_transactions (id text PRIMARY KEY, student_id text NOT NULL REFERENCES users(id), action text NOT NULL, source_type text, source_id text, xp integer NOT NULL, "timestamp" timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS assignments (id text PRIMARY KEY, title text NOT NULL, description text, teacher_id text NOT NULL REFERENCES users(id), class_id text NOT NULL REFERENCES classes(id), course_id text REFERENCES courses(id), lesson_id text REFERENCES lessons(id), type text NOT NULL, start_date timestamptz NOT NULL, due_date timestamptz NOT NULL, status text DEFAULT 'DRAFT', created_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS student_assignments (id text PRIMARY KEY, assignment_id text NOT NULL REFERENCES assignments(id), student_id text NOT NULL REFERENCES users(id), status text DEFAULT 'NOT_STARTED', score integer, started_at timestamptz, completed_at timestamptz);
CREATE TABLE IF NOT EXISTS notifications (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id), type text NOT NULL, title text NOT NULL, message text NOT NULL, resource_type text, resource_id text, read_at timestamptz, created_at timestamptz NOT NULL);

CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_student ON learning_events(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_jobs(status);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
