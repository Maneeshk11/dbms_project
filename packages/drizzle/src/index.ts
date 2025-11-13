import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const conn = postgres(
  process.env.DATABASE_URL ||
    "postgresql://postgres:indiaismycountry@db.jcrjqubawuwzjfxlajol.supabase.co:5432/postgres",
  { prepare: false }
);
export const db = drizzle(conn, { schema });

export * from "drizzle-orm";
