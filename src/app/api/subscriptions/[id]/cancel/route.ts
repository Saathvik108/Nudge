import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { canAccess } from "@/lib/plan";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!canAccess(user.plan as "free" | "plus" | "premium", "subscription_killer")) {
    return NextResponse.json({ error: "Upgrade to Plus." }, { status: 402 });
  }
  const sub = await prisma.subscription.findFirst({
    where: { id, userId: user.id },
  });
  if (!sub) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { cancelled: true, cancelledAt: new Date() },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { xp: { increment: 75 } },
  });

  // Auto-award badge if 3+ cancelled
  const cancelledCount = await prisma.subscription.count({
    where: { userId: user.id, cancelled: true },
  });
  if (cancelledCount >= 3) {
    const badge = await prisma.badge.findUnique({ where: { code: "sub_slayer" } });
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
