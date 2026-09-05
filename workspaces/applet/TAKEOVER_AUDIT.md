# TAKEOVER AUDIT

## Architecture
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Zustand, React Router, Radix/Lucide icons.
- **Backend**: Express (served alongside Vite in development mode, compiled to standalone Node in prod).
- **Security**: JWT authentication, bcrypt hashed passwords, custom JWT middleware.

## Frontend
- Design System: High contrast, rounded borders, colorful indicators, playful UI tailored for students.
- State: Managed via `zustand` (`authStore`, `studentStore`).
- Routing: Client-side routing with `react-router-dom`.

## Backend
- API runs on Express at `/api/*`.
- File uploads: `multer` to memory or disk.

## Database
- SQLite (LibSQL) managed by Drizzle ORM.
- **Schema**: users, roles, subjects, courses, chapters, lessons, lesson_sections, experiments, exercises, questions, answers, progress, achievements, learnerProfiles, conceptMastery, learningEvents, flashcards, aiConversations, aiMessages, recommendations.

## Authentication
- JWT based with bcrypt (`/api/auth/login`).
- `authStore` on the frontend for persisting tokens.

## RBAC
- Supported roles: `SUPER_ADMIN`, `TEACHER`, `STUDENT`.
- Handled at DB schema level with foreign keys mapped to `users`.

## PDF Pipeline (Phase 3)
- **Status**: COMPLETED.
- Implementation: `PipelineManager.ts`, `DocumentAnalyzer.ts`, `ai.ts` routes.
- Flow: Upload PDF -> Store -> Create AI Job -> Extract/Analyze/Generate -> Save to DB.

## AI Pipeline
- Uses `@google/genai` SDK (`GeminiProvider.ts`).
- Orchestrates via `ModelRouter.ts` (AITaskType mapped to capabilities).
- Core AI rules enforce JSON generation and strict schema outputs.

## Simulation Engine (Phase 4)
- **Status**: COMPLETED.
- Exists in `PhysicsEngine.ts` and `OhmsLawSimulation.tsx`, `SimulationPlayer.tsx`.
- Simulations run deterministically based on configs (Ohm's Law, Free Fall, Hooke's Law). 
- **Rule Check**: Engine handles physics directly; AI only sets configurations.

## Student System
- Dashboard, Course Explorer, Flashcards, Achievements, Profile, AITutor, Exercises, LessonPlayer.
- Note: Several UIs (like Dashboard, Profile, Flashcards, Exercises) currently use mocked data via `studentStore.ts` or hardcoded constants.

## Teacher System
- Admin/Teacher Dashboard, Course Management, Lesson Builder, Exercise Bank, Experiment Library, Media Library, AIPipeline Review, User Management.

## Analytics & Gamification
- Analytics tracked via `progress` and `learning_events` tables (`EventTrackingService.ts`).
- Gamification tracked via `achievements` and `studentAchievements`.

## Current Phase 5 Status

- **COMPLETED**:
  - AI Tutor UI (`AITutor.tsx`)
  - Learner Profile (Schema + API backend endpoints)
  - Concept Mastery (Schema + basic API fetching)
  - Learning Events (Schema + tracking API)

- **PARTIAL / IN PROGRESS**:
  - AI Tutor backend: Basic structured chat integrated with Gemini (`TutorService.ts`), but complex contexts (Socratic Mode, Hint System) need expansion.
  - Recommendation Engine: Has schema and API endpoint, but uses stubbed logic in `RecommendationService.ts`.

- **MOCKED**:
  - Personalized Quiz: `Exercises.tsx` uses hardcoded questions.
  - Spaced Repetition / Flashcards: `Flashcards.tsx` uses hardcoded UI definitions, ignoring the DB schema entirely.
  - Student Dashboard/Profile UI: Displaying mocked Zustand XP, Levels, and Streaks instead of fetching from the DB.

- **BROKEN**:
  - No critical application-breaking regressions found on startup/build, but the disconnect between mocked frontend UIs and implemented backend schemas means data isn't flowing end-to-end for Phase 5.

- **MISSING**:
  - Teacher AI Assistant
  - Exam Preparation
  - Early Warning System
  - Adaptive Learning triggers

## Recommended Next Task
- Connect the frontend **Profile**, **Dashboard**, **Exercises** (Quizzes), and **Flashcards** to the existing `learning.ts` API routes and Database models to replace the mocked state.
- Expand `TutorService.ts` to fully support Socratic Context and Hint systems.

## Files that Need Modification
- `/src/store/studentStore.ts` (Needs async actions to fetch from API)
- `/src/pages/student/Dashboard.tsx`
- `/src/pages/student/Profile.tsx`
- `/src/pages/student/Exercises.tsx`
- `/src/pages/student/Flashcards.tsx`
- `/src/services/learning/RecommendationService.ts` (Replace stubs with real query logic)
