// One-off migration: add assignment/submission columns for the
// student <-> teacher assignment workflow on the SQLite dev database.
import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";

const url = process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("postgres")
  ? process.env.DATABASE_URL
  : "file:local.db";

if (url.startsWith("postgres")) {
  console.log("Skipping SQLite migration for postgres database.");
  process.exit(0);
}

if (!existsSync(url.replace("file:", ""))) {
  console.log("Database file not found, nothing to migrate.");
  process.exit(0);
}

const db = createClient({ url });

async function columnExists(table, column) {
  const result = await db.execute(`PRAGMA table_info(${table})`);
  return result.rows.some((r) => r.name === column);
}

const migrations = [
  ["assignments", "attach_file_key", "ADD COLUMN attach_file_key text"],
  ["assignments", "attach_file_name", "ADD COLUMN attach_file_name text"],
  ["student_assignments", "submission_comment", "ADD COLUMN submission_comment text"],
  ["student_assignments", "submission_file_key", "ADD COLUMN submission_file_key text"],
  ["student_assignments", "submission_file_name", "ADD COLUMN submission_file_name text"],
  ["student_assignments", "feedback", "ADD COLUMN feedback text"],
  ["student_assignments", "graded_at", "ADD COLUMN graded_at integer"],
];

for (const [table, column, statement] of migrations) {
  try {
    if (await columnExists(table, column)) {
      console.log(`OK: ${table}.${column} already exists`);
      continue;
    }
    await db.execute(`ALTER TABLE ${table} ${statement}`);
    console.log(`OK: applied ${table} ${statement}`);
  } catch (err) {
    console.error(`FAILED: ${table} ${statement}`, err.message);
  }
}

db.close?.();