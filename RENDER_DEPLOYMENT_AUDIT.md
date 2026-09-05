# PHK STEM LAB - Render Pre-Deployment Audit

Audit date: 2026-09-05

Post-hardening update: runtime port, JWT validation, configurable database selection, storage abstraction, upload checks, health check, PostgreSQL baseline migration, and Render blueprint were added after the initial audit. See `RENDER_READINESS_REPORT.md` for the current PASS/BLOCKED gate.

## Executive Summary

PHK STEM LAB is a full-stack monolith, not a frontend-only application. It contains a React/Vite browser application, an Express API server, JWT authentication, a Drizzle ORM data layer, a local LibSQL/SQLite database, PDF upload and AI processing, and browser-side physics simulations.

The current code is suitable for a first Render **Web Service** deployment after the blockers in this document are addressed. It is not suitable for a Render **Static Site** as-is because the application requires Express, authentication, database access, Gemini calls, and PDF processing.

No deployment was performed during this audit.

## Architecture

- Frontend: React 19 + TypeScript + Vite.
- UI: Tailwind CSS with `@tailwindcss/vite`, Lucide icons, Zustand state management.
- Routing: `react-router-dom` with client-side `BrowserRouter`.
- Backend: Express 4 in `server.ts`.
- API: Express routes mounted below `/api`.
- ORM: Drizzle ORM.
- Authentication: JWT tokens stored in browser `localStorage`; passwords hashed with `bcryptjs`.
- Authorization: RBAC roles `SUPER_ADMIN`, `TEACHER`, and `STUDENT`.
- AI: Google Gemini through `@google/genai`.
- Simulation: Browser-side `mathjs` physics engine; no separate simulation server.
- Build output: Vite output in `dist/` plus bundled server at `dist/server.cjs`.

## Direct Answers

| Question                                   | Finding                                                                                                                                                                                                                          |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend-only or full-stack?               | Full-stack monolith.                                                                                                                                                                                                             |
| Frontend framework                         | React 19 + TypeScript + Vite.                                                                                                                                                                                                    |
| Backend framework                          | Express 4 with TypeScript, run through `tsx` in development and bundled by `esbuild` for production.                                                                                                                             |
| Command that starts frontend               | No separate frontend process. `npm run dev` starts Express, which mounts Vite middleware in development.                                                                                                                         |
| Command that starts backend                | Development: `npm run dev`. Production: `npm start` (`node dist/server.cjs`).                                                                                                                                                    |
| Command that builds frontend               | `npm run build`; this builds Vite frontend and bundles the backend server.                                                                                                                                                       |
| Database                                   | LibSQL client with a local SQLite file, currently hardcoded as `file:local.db`.                                                                                                                                                  |
| External services                          | Google Gemini is required for AI features. Google Fonts and DiceBear avatars are also referenced by the UI. No external object storage is configured.                                                                            |
| Required environment variables             | See the Environment Variables section. `JWT_SECRET`, `NODE_ENV`, and `GEMINI_API_KEY` are operationally important for production. `DATABASE_URL` is desired but not currently supported by code.                                 |
| Does server listen on `process.env.PORT`?  | Yes. `server.ts` reads `process.env.PORT` through the shared runtime config and binds `0.0.0.0`; local fallback is `3000`.                                                                                                       |
| Does frontend know production API URL?     | It uses relative `/api/...` URLs. This works for one combined Web Service, but there is no configurable API base URL for a split deployment.                                                                                     |
| Hardcoded localhost URLs                   | No `localhost` or `127.0.0.1` URL was found in application source. The server binds to `0.0.0.0`, but its port is hardcoded.                                                                                                     |
| API keys in source code                    | No literal Gemini/API key was found. The Gemini key is read from `process.env.GEMINI_API_KEY`.                                                                                                                                   |
| Files that should not be committed         | `local.db` is currently Git-tracked and contains runtime data. `uploads/`, generated `dist/`, `.env`, logs, and local dependencies should not be committed. `.gitignore` excludes most of these but does not exclude `local.db`. |
| Suitable for Render Static Site?           | No, not as-is. A Static Site cannot run this Express API, database access, authentication, Gemini calls, or PDF pipeline.                                                                                                        |
| Suitable for Render Web Service?           | Yes, as a single Web Service after external PostgreSQL/Gemini/storage verification.                                                                                                                                              |
| Separate frontend/backend services needed? | No for the initial deployment. A single Web Service best matches the current relative API URLs. Separate services are an optional later architecture.                                                                            |

## Render Deployment Type

### Recommended initial deployment: Web Service

Use one Render Web Service from the repository root.

- Root directory: `.`
- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Publish directory: not used by a Web Service. The server serves `dist/` itself in production.
- Health check: add a lightweight endpoint such as `/health` before deployment, or use `/` only after confirming the production server serves the SPA.
- Set `NODE_ENV=production` in Render. The server currently uses this flag to choose between Vite middleware and static `dist/` serving.
- Render supplies `PORT`; the server must consume it before deployment.

### Render Static Site

A Static Site could host only the Vite-generated `dist/` directory after the frontend is separated from the API. It would require:

- A separate deployed API URL.
- A configurable frontend API base URL.
- Restricted CORS on the Express service.
- Separate handling for SPA route rewrites.
- A separate database and durable upload strategy.

That is not the current architecture and is not recommended for the first deployment.

## Commands

From `package.json`:

```text
npm run dev       # Express + Vite middleware development server
npm run build     # Vite frontend build and esbuild server bundle
npm start         # node dist/server.cjs
npm run db:push   # Drizzle schema push against configured local database
npm run db:seed   # Seed demo roles, users, courses and learning data
npm run lint      # TypeScript check
```

The repository contains both `package-lock.json` and `bun.lock`. Render should use npm consistently with `package-lock.json`; remove the ambiguity later if the team standardizes on one package manager.

## Database Requirements

Current implementation:

- `src/db/index.ts` always opens `file:local.db`.
- `drizzle.config.ts` also hardcodes `file:local.db`.
- The schema contains users, roles, courses, chapters, lessons, documents, AI jobs, learning progress, achievements, flashcards, conversations, assignments, classes, notifications, and analytics-related data.
- `local.db` is currently tracked by Git.

Render risk:

- The default Render filesystem is ephemeral across deploys/restarts.
- A local SQLite file is not appropriate for multiple instances.
- User registrations, progress, AI jobs, and other writes can be lost after a restart.
- Running `npm run db:seed` against production would create demo accounts and must be an explicit decision.

Recommended production database:

1. Use a managed LibSQL/Turso database and change the DB client to read `DATABASE_URL` and, if required by the provider, an auth token.
2. Apply migrations/schema intentionally before serving traffic.
3. Remove `local.db` from Git history or at minimum stop tracking it and add it to `.gitignore`.
4. Never seed demo credentials into the production database without a deliberate production seed plan.

A Render persistent disk can preserve a single local SQLite file, but it keeps the deployment single-instance and is a weaker long-term choice than managed storage.

## Environment Variables

### Used by source code

| Variable                 | Status                                                                       | Purpose                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `JWT_SECRET`             | Read by `server.ts` and route middleware; currently has an insecure fallback | Signing and verifying authentication tokens. Must be a long random production secret.                   |
| `NODE_ENV`               | Read by `server.ts`                                                          | Must be `production` so the server serves `dist/` rather than starting Vite middleware.                 |
| `GEMINI_API_KEY`         | Read by `GeminiProvider`                                                     | Server-side Google Gemini access for tutor, teacher AI, exam preparation, PDF analysis, and validation. |
| `GEMINI_FAST_MODEL`      | Optional read by `ModelRouter`                                               | Model for normal/high-volume tasks.                                                                     |
| `GEMINI_REASONING_MODEL` | Optional read by `ModelRouter`                                               | Model for reasoning/physics validation tasks.                                                           |
| `DISABLE_HMR`            | Read by `vite.config.ts`                                                     | Development-only Vite HMR/watch behavior. Not needed in production.                                     |

### Documented but not currently used

- `APP_URL` appears in `.env.example` but is not read by source code.
- `DATABASE_URL` is not currently read; adding it is required for a managed production database.

### Local `.env` behavior

The `dotenv` package is installed, but no `dotenv/config` import or explicit `dotenv.config()` call was found. Render-injected variables are available directly to Node, but a local `.env` file will not automatically load through the current application. For local `.env` support, load dotenv in the server entrypoint or use a runtime command that loads it.

## Backend and API Configuration

The Express server mounts:

- `/api/auth/login`
- `/api/auth/register`
- `/api/users/me`
- `/api/courses`
- `/api/ai`
- `/api/learning`
- `/api/teacher/ai`
- `/api/exam-preparation`
- `/api/early-warning`
- `/api/classes`
- `/api/assignments`
- `/api/gamification`
- `/api/notifications`
- `/api/analytics`

The frontend calls these endpoints with relative paths such as `/api/auth/login` and `/api/learning/tutor/chat`. Therefore a combined Web Service avoids production API URL configuration and cross-origin browser requests.

## CORS Requirements

Current code uses unrestricted `cors()`.

- Same-origin combined Web Service: this is usually functional, but it is broader than necessary.
- Split frontend/API services: configure CORS to allow only the exact production frontend origin, such as `https://your-frontend.onrender.com`, and ensure authorization headers are allowed.
- Do not use `cors()` unrestricted in a public production API unless there is a specific reason.
- Helmet is enabled, but CSP is explicitly disabled for Vite HMR. Review this for production; CSP can be enabled with a production-specific policy.

## Authentication and Authorization

- Login and registration issue JWT tokens.
- Tokens are stored in browser `localStorage`.
- Passwords are hashed with `bcryptjs`.
- Protected routes use JWT middleware and role checks.
- Several route modules duplicate JWT middleware and duplicate the fallback secret rather than importing one shared configuration.
- The fallback secret `phk-stem-lab-super-secret-key-2026` must not be accepted in production.
- Demo accounts and the shared password `password123` are documented and seeded for local use; do not use them in production.
- Review ownership checks and role enforcement again before exposing teacher/admin operations publicly. The project contains prior audit scripts, but those are not a substitute for production verification.

## File Upload and PDF Processing

Current flow:

1. Admin/teacher uploads a PDF to `/api/ai/upload-pdf`.
2. Multer stores the upload in memory with a 50 MB limit.
3. The route writes the file to `process.cwd()/uploads`.
4. The document path and metadata are stored in the database.
5. `PipelineManager` reads the local file, encodes it as base64, and sends it as inline PDF data to Gemini.
6. The pipeline creates a lesson and updates the AI job status.

Render blockers and risks:

- `uploads/` is ephemeral without a persistent disk.
- Stored absolute/local paths become invalid if the instance changes.
- No object storage provider is configured.
- The AI job is launched in-process and is not backed by a queue or worker; deploys/restarts can interrupt it.
- There is no cleanup policy for uploaded files.
- No PDF parser library is used; Gemini receives the PDF as base64 inline data, so Gemini limits, request size, quota, and processing time apply.

Recommended production solution: store PDFs in durable object storage (S3-compatible storage, Cloudflare R2, or similar), store an object key rather than a local path, and move long-running AI work to a durable queue/worker when reliability matters.

## AI Provider

Only Google Gemini was found.

- SDK: `@google/genai`.
- Provider: `src/services/ai/GeminiProvider.ts`.
- Consumers include student tutor, teacher assistant, exam preparation, PDF document analysis, and physics validation.
- `GEMINI_API_KEY` must remain server-side and must not be prefixed with `VITE_` or exposed in frontend code.
- `.env.example` documents Gemini 2.5 model names, while `ModelRouter.ts` defaults to Gemini 3.6 names. Verify the exact model names available to the Google account and configure them explicitly in Render.
- AI calls are rate-limited, but quota, cost, timeout, retries, and background job durability still need operational policy.

## Simulation

Simulation code is browser-local:

- `PhysicsEngine` uses `mathjs` for formula evaluation and constraints.
- `SimulationPlayer` currently routes the registered Ohm's Law simulation.
- No external simulation service is required.
- Simulation state is not inherently persisted unless a learning API records it.

This portion does not create a Render deployment dependency.

## Storage and External URLs

- Database storage: local `local.db`, not durable on default Render filesystem.
- Upload storage: local `uploads/`, not durable on default Render filesystem.
- No S3, R2, Cloudinary, or other object storage integration found.
- Google Fonts is imported by `src/index.css`.
- DiceBear avatar URLs are referenced by the admin profile UI.
- No hardcoded `localhost` or `127.0.0.1` API URL was found.

## Potential Blockers Before Deployment

### Must fix before production

1. Configure Render's supplied `PORT` and verify health checks in the deployed service.
2. Set `NODE_ENV=production` in Render and confirm the production server serves `dist/index.html`.
3. Configure a durable managed database or explicitly accept a single-instance persistent disk for a temporary deployment.
4. Use the environment-driven `DATABASE_URL` and run the PostgreSQL baseline migration.
5. Stop tracking `local.db` and ensure it contains no production or personal data.
6. Require a strong `JWT_SECRET` in production and remove the insecure fallback behavior.
7. Decide how uploaded PDFs will be durably stored; local `uploads/` is not reliable on Render's default filesystem.
8. Confirm Gemini model names, API quota, billing, and `GEMINI_API_KEY` in Render.

### Strongly recommended before public launch

- Restrict CORS to known origins.
- Add a `/health` endpoint and configure Render health checks.
- Add request timeouts, error handling, and cleanup for PDF/AI jobs.
- Replace in-process AI jobs with a durable queue/worker for production reliability.
- Review all admin/teacher resource ownership and authorization paths.
- Decide whether browser `localStorage` JWT storage is acceptable for the threat model.
- Pin the Node version with `engines` or Render configuration.
- Split large frontend chunks with route-level dynamic imports if initial load performance matters.
- Run dependency/security review; the local install reported 7 moderate npm audit findings.
- Do not expose demo credentials in production documentation.

## Recommended Render Architecture

### Phase 1: single Web Service

```text
Render Web Service
  React/Vite static assets from dist/
  Express API from dist/server.cjs
  JWT authentication
       |
       +--> Managed LibSQL/Turso database
       +--> Google Gemini API
       +--> Object storage for uploaded PDFs
```

Suggested Render settings:

```text
Root Directory: .
Build Command: npm ci && npm run build
Start Command: npm start
Environment: NODE_ENV=production
```

The existing relative `/api/...` frontend calls work naturally with this arrangement.

### Phase 2: split services, only if needed

```text
Render Static Site (Vite dist/)
  |
  +--> Render Web Service (Express API)
          |
          +--> Managed LibSQL/Turso
          +--> Google Gemini
          +--> Object storage
          +--> Durable AI worker/queue
```

A split architecture requires a frontend API base URL, restricted CORS, SPA rewrites on the Static Site, and coordinated environment variables. It is not required for the first Render deployment.

## Final Verdict

- Full-stack: **Yes**.
- Render Static Site: **No, not as-is**.
- Render Web Service: **Yes, after the mandatory blockers are addressed**.
- Separate frontend/backend services: **Not required initially**.
- Safe immediate production deployment: **No**. The hardcoded port, ephemeral local database/upload storage, fallback JWT secret, and unverified AI model configuration should be resolved first.
