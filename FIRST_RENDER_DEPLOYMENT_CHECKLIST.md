# First Render Deployment Checklist

Status: prepared for a controlled deployment review; do not treat this as a public-production approval.

## Repository

- [x] `local.db` removed from Git tracking and ignored.
- [x] `.env`, uploads, build output, logs and secrets ignored.
- [ ] Review pending working-tree changes and commit intentionally.
- [ ] Confirm no real secrets or personal data are in Git history.

## Database

- [x] `DATABASE_URL` is the production configuration boundary.
- [x] PostgreSQL schema baseline and migration runner exist.
- [ ] Create Render PostgreSQL database.
- [ ] Run `npm run db:migrate:pg`.
- [ ] Run `npm run db:verify:pg`.
- [ ] Decide whether any local data needs a reviewed export/migration.
- [ ] Verify foreign keys and row counts.

## Storage

- [x] StorageProvider abstraction is used by PDF upload and pipeline.
- [x] Render persistent disk is described in `render.yaml`.
- [ ] Confirm `/var/data` persistent disk is mounted.
- [ ] Upload, download, metadata and delete checks.
- [ ] Restart service and confirm PDF remains.
- [ ] Choose object storage before scaling beyond one instance.

## AI

- [x] Gemini key remains server-side.
- [x] `AI_PROVIDER`, `FAST_MODEL`, `REASONING_MODEL` are configurable.
- [ ] Set `GEMINI_API_KEY` in Render.
- [ ] Verify configured model identifiers with the Google account/API.
- [ ] Run minimal Gemini request.
- [ ] Verify tutor, teacher AI and exam preparation.

## Authentication

- [x] Production fails fast without `JWT_SECRET`.
- [x] Login and registration issue JWTs.
- [ ] Test login and register against PostgreSQL.
- [ ] Decide whether localStorage JWT is acceptable for controlled testing.
- [ ] Plan httpOnly secure cookie migration before public launch.

## Authorization

- [x] Server-side auth middleware is present.
- [x] Notification, class, assignment and lesson ownership checks added.
- [ ] Student cannot access admin/teacher endpoints.
- [ ] Student A cannot access Student B data.
- [ ] Teacher A cannot access Teacher B class analytics/assignment resources.
- [ ] Unauthorized user cannot publish.
- [ ] Repeat checks against production PostgreSQL.

## CORS

- [x] Production origin is configurable with `FRONTEND_URL`.
- [x] Same-origin one-service architecture avoids cross-origin API calls.
- [ ] Set and verify exact frontend origin if services are split.
- [ ] Test authenticated requests with Authorization header.

## Environment

- [x] `.env.example` includes database, JWT, AI, CORS, storage and limits.
- [ ] Set all production values in Render Environment.
- [ ] Never paste secrets into Git or frontend variables.

## Build

- [x] `npm run lint` passed locally.
- [x] `npm run build` passed locally.
- [x] `npm ci && npm run build` is the Render build command.
- [ ] Review non-blocking bundle-size warning.

## Start

- [x] `npm start` runs `node dist/server.cjs`.
- [x] Production bundle started locally on a temporary port.
- [ ] Start from a clean Render filesystem/environment.

## Health

- [x] `GET /health` exists and avoids secrets.
- [x] Local production smoke test returned HTTP 200.
- [ ] Verify Render health check returns database/storage `ok`.

## PDF

- [x] File size, extension, MIME and `%PDF-` signature checks exist.
- [x] PDF uses StorageProvider and configurable storage root.
- [ ] Upload a valid PDF as teacher/admin.
- [ ] Track job through Gemini analysis, lesson generation, review and publish.
- [ ] Restart and confirm persistence.

## Simulation

- [x] Ohm's Law simulation is browser-local and uses mathjs.
- [ ] Open and interact with simulation after deployment.

## Analytics

- [x] Analytics route is present and ownership is checked for teacher class access.
- [ ] Verify analytics against real PostgreSQL rows.
- [ ] Verify Teacher A cannot read Teacher B class data.

## Test tooling

- [x] `test-ui-links.cjs` fixed to CommonJS and passes.
- [x] `test-idor.cjs` no longer requires undeclared axios and runs.
- [ ] Replace static IDOR assertion with an authenticated integration test before public launch.
