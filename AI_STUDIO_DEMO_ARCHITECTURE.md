# AI STUDIO DEMO ARCHITECTURE

## Frontend
- Framework: React 19 + Vite
- Routing: React Router v7
- Styling: Tailwind CSS v4

## Backend
- Framework: Express.js (runs on port 3000)
- Deployment: Compiled with esbuild to `dist/server.cjs` and served via Node.js.

## Database
- SQLite (via LibSQL adapter) is used for the demo (`local.db`).
- Drizzle ORM handles database access.
- Note: The database is stored locally in the container's filesystem.

## Storage
- Provider: Local Filesystem Storage (`uploads/` directory).
- Uploaded PDFs and generated content are stored locally.
- Note on Persistence: Storage is **temporary**. Google AI Studio's default runtime environment for applets does not provide durable persistent disks. Files and database data will be lost if the container restarts.

## AI Configuration
- Provider: Google Gemini API.
- SDK: `@google/genai`
- Models: Uses models as defined by `FAST_MODEL` and `REASONING_MODEL`.
- The `GEMINI_API_KEY` must be configured via Google AI Studio's Secrets panel.

## Authentication & Authorization
- Role-based Access Control (RBAC) is implemented via JWT tokens.
- Secure HTTP-only cookies/headers are used for session management.
- Admin demo account (Phạm Hữu Khê) handles elevated permissions.

## Simulation
- Simulations (Ohm's Law, Free Fall, Hooke's Law) execute client-side.
