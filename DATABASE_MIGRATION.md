# Database Migration

## Production path

Production uses PostgreSQL through `DATABASE_URL`. The application selects the PostgreSQL Drizzle schema when the URL starts with `postgres`; local development keeps SQLite with `file:local.db`.

Create a PostgreSQL database in Render, set its connection string as `DATABASE_URL`, then run:

```bash
npm run db:migrate:pg
npm run db:verify:pg
```

The baseline is [drizzle/0000_postgresql_initial.sql](drizzle/0000_postgresql_initial.sql). It creates the current application entities, foreign keys and operational indexes. The Render blueprint runs this idempotent baseline before `npm start`.

## Local development

```bash
npm run db:push
npm run db:seed
```

These commands use the local SQLite fallback when `DATABASE_URL` is unset or starts with `file:`. `local.db` is intentionally ignored by Git.

## Existing development data

Do not copy `local.db` into production blindly. Preserve it as a local backup if its demo data is needed. For a real data migration, export each table, transform SQLite integer timestamps/booleans to PostgreSQL `timestamptz`/`boolean`, load parent tables before child tables, and verify foreign-key counts. No automatic production data migration is included because no approved source backup or data retention decision was provided.

## Seed policy

`npm run db:seed` creates demo roles/users/courses and uses the development demo password. Run it only against a disposable development database. Production should use a reviewed seed with unique credentials or an administrator invitation flow.

## Integrity verification

```bash
npm run db:verify:pg
```

The verifier confirms that the PostgreSQL connection works and reports the public table count. Before launch, additionally verify row counts, foreign keys, login, registration, lesson/progress writes, assignments, notifications, AI jobs and a restart persistence cycle against the Render database.

## Files

- Runtime adapter: `src/db/index.ts`
- PostgreSQL schema: `src/db/schema.pg.ts`
- Local SQLite schema: `src/db/schema.sqlite.ts`
- Runtime schema selector: `src/db/schema.ts`
- Drizzle CLI config: `drizzle.config.ts`
- Baseline migration: `drizzle/0000_postgresql_initial.sql`
- Migration runner: `scripts/run-postgres-migration.mjs`
- Verification script: `scripts/verify-postgres.mjs`
