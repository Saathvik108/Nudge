import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const ALLOWED = new Set(["free", "plus", "premium"]);

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const plan = body.plan;
  if (!ALLOWED.has(plan)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }
  const user = await getCurrentUser();
  await prisma.user.update({ where: { id: user.id }, data: { plan } });

  if (plan !== "free") {
    const badge = await prisma.badge.findUnique({ where: { code: "upgraded" } });
    if (badge) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: user.id, badgeId: badge.id } },
        update: {},
        create: { userId: user.id, badgeId: badge.id },
      });
    }
  }
  if (plan === "premium") {
    const badge = await prisma.badge.findUnique({ where: { code: "premium" } });
    if (badge) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: user.id, badgeId: badge.id } },
        update: {},
        create: { userId: user.id, badgeId: badge.id },
      });
    }
  }
  return NextResponse.json({ ok: true });
}
