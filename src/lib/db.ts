import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { SEED_DB_GZ_B64 } from "./seed-blob";

// Zero-config database: when DATABASE_URL isn't provided, materialize the
// embedded pre-seeded SQLite database to a writable location and point
// Prisma at it. On Vercel the only writable path is /tmp (ephemeral), so
// data resets when the instance recycles — fine for a demo. Setting
// DATABASE_URL explicitly (e.g. a Postgres URL) overrides all of this.
function ensureDatabaseUrl() {
  // The schema's provider is sqlite, so only a `file:` URL is usable. Respect
  // such an override; otherwise ignore whatever is set (e.g. a leftover or
  // auto-injected Postgres URL on the host) and fall back to the embedded DB.
  if (process.env.DATABASE_URL?.startsWith("file:")) return;

  const onServerless = Boolean(process.env.VERCEL || process.env.AWS_REGION);
  const target = onServerless
    ? "/tmp/nudge.db"
    : path.join(process.cwd(), "prisma", "dev.db");

  try {
    if (!fs.existsSync(target) || fs.statSync(target).size === 0) {
      const buf = zlib.gunzipSync(Buffer.from(SEED_DB_GZ_B64, "base64"));
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, buf);
    }
    process.env.DATABASE_URL = `file:${target}`;
  } catch (err) {
    // Leave DATABASE_URL unset; the layout's setup screen will explain.
    console.error("[nudge] could not unpack embedded database:", err);
  }
}

ensureDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
