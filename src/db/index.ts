import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import fs from "fs";

// Create local sqlite database file if it doesn't exist
const dbFile = "local.db";

const client = createClient({
  url: `file:${dbFile}`,
});

export const db = drizzle(client, { schema });
