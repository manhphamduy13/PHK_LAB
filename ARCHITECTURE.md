# Architecture Overview

## Domain Driven Design

The application is split into multiple logical domains represented in the database and API architecture:
- **Authentication**: JWT based.
- **Users & Roles**: RBAC mapping (SUPER_ADMIN, TEACHER, STUDENT).
- **Learning Content**: Courses -> Chapters -> Lessons -> Lesson Sections.
- **Interactivity**: Experiments, Simulations, Exercises.
- **Tracking**: Progress, Achievements, Study Sessions.

## Frontend
- **Design System**: High contrast, playful colors (blue, amber, emerald, purple), heavily rounded borders (`rounded-2xl`, `rounded-3xl`), bold typography.
- **State Management**: `zustand` for global state (Auth), React state for local.
- **Routing**: Client-side routing with `react-router-dom`. Protected routes check Zustand store `isAuthenticated` and `role`.

## Backend
- **Express**: Runs on port 3000.
- **API Layer**: Mounts on `/api/*`.
- **Database Layer**: `drizzle-orm` accessing LibSQL.
- **Security**: Passwords hashed with `bcryptjs`. Endpoints protected via custom JWT middleware.
