import type { User } from "@prisma/client";
import { prisma } from "./db";

// In a real app this would read the session. For the demo we have one user.
export const getCurrentUser = async () => {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!user) throw new Error("No user seeded. Run `npm run db:reset`.");
  return user;
};

export const getCurrentUserId = async () => {
  const u = await getCurrentUser();
  return u.id;
};

export type SetupReason =
  | "no_database_url"
  | "cannot_connect"
  | "auth_failed"
  | "db_missing"
  | "no_tables"
  | "not_seeded"
  | "error";

export type UserLoad =
  | { ok: true; user: User }
  | { ok: false; reason: SetupReason; detail?: string };

// Non-throwing loader used by the layout so a misconfigured database renders
// an actionable setup screen instead of a blank "server error".
export const getCurrentUserSafe = async (): Promise<UserLoad> => {
  if (!process.env.DATABASE_URL) return { ok: false, reason: "no_database_url" };
  try {
    const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
    if (!user) return { ok: false, reason: "not_seeded" };
    return { ok: true, user };
  } catch (e: unknown) {
    return { ok: false, ...classifyDbError(e) };
  }
};

export const classifyDbError = (
  e: unknown,
): { reason: SetupReason; detail?: string } => {
  const err = e as { code?: string; errorCode?: string; message?: string };
  const code = err?.code ?? err?.errorCode;
  const msg = String(err?.message ?? e);
  if (msg.includes("Environment variable not found")) return { reason: "no_database_url" };
  if (code === "P1000") return { reason: "auth_failed", detail: msg };
  if (code === "P1001" || code === "P1002") return { reason: "cannot_connect", detail: msg };
  if (code === "P1003") return { reason: "db_missing", detail: msg };
  if (code === "P2021" || code === "P2022") return { reason: "no_tables", detail: msg };
  return { reason: "error", detail: msg.slice(0, 600) };
};
