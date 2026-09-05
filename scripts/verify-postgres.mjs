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
  const result = await client.query(
    "SELECT count(*)::int AS table_count FROM information_schema.tables WHERE table_schema = 'public'",
  );
  console.log(
    JSON.stringify({ status: "ok", tableCount: result.rows[0].table_count }),
  );
} finally {
  await client.end();
}
