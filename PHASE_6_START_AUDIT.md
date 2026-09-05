# Phase 6 Start Audit

## Gamification
- Existing: `totalXp`, `learningStreak` in `learnerProfiles`. `achievements` and `studentAchievements` tables exist.
- Missing: XP Transaction Log (`xp_transactions`), Level (`current_level` calculation), Quests (`quests`, `student_quests`), Leaderboard logic.
- Status: PARTIAL

## Assignments
- Existing: None.
- Missing: `assignments`, `student_assignments` (submissions).
- Status: MISSING

## Teacher Class Management
- Existing: Teachers own courses.
- Missing: `classes` (e.g. 8A1, 8A2), `enrollments` (Student to Class or Course).
- Status: MISSING

## Notifications
- Existing: None.
- Missing: `notifications` table, NotificationService.
- Status: MISSING

## Analytics & Reporting
- Existing: `learning_events` tracks actions.
- Missing: Teacher Dashboard for Class analytics, Concept Heatmap, Export functions.
- Status: PARTIAL (Data collection exists, aggregation/UI is missing).

## Early Warning & Interventions (from Phase 5)
- Existing: `early_warning_signals` and `interventions` tables. Basic deterministic API exists. UI exists.
- Missing: Connecting it with real assignment/class data.

## Security & Performance
- Existing: Basic JWT auth. RBAC middleware exists.
- Missing: Strict IDOR checks on all data. Rate Limiting. Caching.

## Plan
1. Extend database schema for Gamification, Assignments, Notifications, and Class Management.
2. Build Gamification Backend (XPEngine, Level logic, Leaderboard API).
3. Build Assignment System (API + Teacher UI + Student UI).
4. Build Notifications (API + UI).
5. Build Analytics & Reporting (Teacher Heatmap + Student Reports).
6. Security Hardening & E2E Verification.
