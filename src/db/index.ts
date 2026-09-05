import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
const databaseUrl = process.env.DATABASE_URL || "file:local.db";

export const db: any = databaseUrl.startsWith("postgres")
  ? drizzlePostgres(
      new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false },
      }),
      { schema },
    )
  : drizzleLibsql(createClient({ url: databaseUrl }), { schema });
