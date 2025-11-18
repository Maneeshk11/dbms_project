import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is required. Please set it in your .env.local file."
  );
}

const conn = postgres(process.env.DATABASE_URL, { prepare: false });
export const db = drizzle(conn, {
  schema: {
    ...schema,
    user: schema.user,
  },
});

export * from "drizzle-orm";
