# PHK STEM LAB - Render Deployment

This repository is prepared for **one Render Web Service**. It is not configured as a Render Static Site because Express, authentication, PostgreSQL, Gemini, and PDF processing run on the server.

## Render settings

`render.yaml` contains the proposed blueprint:

- Root directory: `.`
- Build command: `npm ci && npm run build`
- Start command: `npm run db:migrate:pg && npm start`
- Health check: `/health`
- Publish directory: not applicable to a Web Service; Express serves `dist/`.
- Node runtime: pin a current LTS version in Render or add an `engines` field before production.
- The blueprint provisions PostgreSQL and a persistent disk for the current filesystem storage provider. Object storage is still recommended for scale.

Do not run both a manual service and the blueprint for the same production database without deciding which owns migrations.

## Environment variables

Required in Render:

```text
NODE_ENV=production
DATABASE_URL=<Render PostgreSQL connection string>
JWT_SECRET=<long random secret>
AI_PROVIDER=gemini
GEMINI_API_KEY=<Gemini API key>
FAST_MODEL=gemini-2.5-flash
REASONING_MODEL=gemini-2.5-pro
STORAGE_PROVIDER=filesystem
STORAGE_ROOT=/var/data/uploads
MAX_PDF_SIZE=52428800
MAX_AI_INPUT_SIZE=47185920
```

`PORT` is supplied by Render and is consumed by the server. `FRONTEND_URL` is only needed for a split frontend/API deployment; the recommended single service uses same-origin relative `/api/...` calls.

Never commit `.env` or real credentials. Use [.env.example](.env.example) for local placeholders.

## Database setup

The application selects PostgreSQL when `DATABASE_URL` starts with `postgres`. Without that variable it uses local `file:local.db` and the preserved SQLite schema for development.

PostgreSQL baseline migration:

```bash
npm run db:migrate:pg
npm run db:verify:pg
```

The Render start command applies the idempotent baseline before starting the server. For a larger production system, replace this with a versioned migration runner and run migrations as a controlled release step.

Local demo seed:

```bash
npm run db:push
npm run db:seed
```

Do not run the demo seed against production without reviewing the demo credentials and data policy. A verified SQLite-to-PostgreSQL data migration is not included because no approved production backup/data mapping was supplied; back up and map existing data before attempting a live migration.

## Storage setup

All PDF writes now use `StorageProvider`:

- Local development: `LocalStorageProvider` writes under `uploads/`.
- Current Render blueprint: `ProductionStorageProvider` writes under `/var/data/uploads` on a persistent disk.
- Long-term scale: replace the production implementation with S3-compatible/R2/object storage and store a storage key in the database, not a filesystem path.

The upload route limits size, requires a `.pdf` extension, checks `application/pdf`, and verifies the `%PDF-` file signature. AI input is separately limited by `MAX_AI_INPUT_SIZE`.

## Health check

```text
GET /health
```

Expected response is a safe status object containing `status`, `database`, `storage`, and AI configuration state. It does not return credentials. Render should use `/health` as its health check path.

## Verification after deployment

Run these checks against the deployed URL:

1. `GET /health` returns HTTP 200 with database and storage `ok`.
2. Register a new student, log in, and confirm the student dashboard loads.
3. Confirm a student cannot open admin routes or teacher endpoints.
4. Log in as teacher/admin and verify course, class, assignment, analytics, and notification routes.
5. Open a lesson, exercise, Ohm's Law simulation, and AI Tutor.
6. Upload a small valid PDF as a teacher/admin and track the AI job through review/publish.
7. Restart the service and verify users, lessons, progress, assignments, and AI jobs remain.
8. Confirm the uploaded PDF remains available after restart. This passes only with the persistent disk or object storage configured.
9. Run a minimal Gemini request, then verify PDF analysis and lesson generation within configured quota.
10. Inspect logs to ensure errors expose an `errorId`, not secrets, database URLs, API keys, or unnecessary filesystem details.

## Known limitations before public launch

- The current production storage implementation is a persistent-disk filesystem adapter, not object storage.
- AI jobs run in-process and can be interrupted by a restart; use a durable queue/worker for high reliability.
- JWT tokens remain in browser `localStorage`; moving to secure httpOnly cookies requires a coordinated frontend/API auth change.
- The exact Gemini model availability must be verified against the deployed Google account and API version.
- The existing admin UI still contains known mock display arrays documented in `PROJECT_STATE.md`.
