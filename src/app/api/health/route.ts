import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { classifyDbError } from "@/lib/current-user";

export const dynamic = "force-dynamic";

// Lightweight diagnostic so a misconfigured deploy can be triaged without
// reading platform logs. Safe to expose: reports status, not secrets.
export async function GET() {
  const databaseUrlSet = Boolean(process.env.DATABASE_URL);
  if (!databaseUrlSet) {
    return NextResponse.json(
      {
        ok: false,
        databaseUrlSet,
        reason: "no_database_url",
        hint: "Set DATABASE_URL in Vercel → Settings → Environment Variables.",
      },
      { status: 503 },
    );
  }

  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({
      ok: userCount > 0,
      databaseUrlSet,
      canConnect: true,
      userCount,
      reason: userCount > 0 ? "ready" : "not_seeded",
      hint:
        userCount > 0
          ? undefined
          : "Tables exist but no data. Run `npm run db:seed` with DATABASE_URL set.",
    });
  } catch (e) {
    const { reason, detail } = classifyDbError(e);
    return NextResponse.json(
      { ok: false, databaseUrlSet, canConnect: false, reason, detail },
      { status: 503 },
    );
  }
}
