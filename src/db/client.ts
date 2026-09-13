import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

declare global {
  var __libsqlClient: ReturnType<typeof createClient> | undefined;
}

function buildClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local for local dev.");
  }
  const client = createClient({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  // libsql/SQLite does not enforce FK constraints unless explicitly turned on per-connection.
  void client.execute("PRAGMA foreign_keys = ON");
  return client;
}

const client = global.__libsqlClient ?? buildClient();
if (process.env.NODE_ENV !== "production") {
  global.__libsqlClient = client;
}

export const db = drizzle(client, { schema });
