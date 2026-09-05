import fs from "node:fs/promises";
import pg from "pg";

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || !databaseUrl.startsWith("postgres")) {
  throw new Error("DATABASE_URL must be a PostgreSQL connection string");
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});
try {
  await client.connect();
  const migration = await fs.readFile(
    new URL("../drizzle/0000_postgresql_initial.sql", import.meta.url),
    "utf8",
  );
  await client.query(migration);
  console.log("PostgreSQL baseline migration applied.");
} finally {
  await client.end();
}
