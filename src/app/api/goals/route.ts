import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { canAccess } from "@/lib/plan";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const user = await getCurrentUser();
  const plan = user.plan as "free" | "plus" | "premium";

  const existing = await prisma.goal.count({
    where: { userId: user.id, active: true },
  });
  if (existing >= 1 && !canAccess(plan, "goal_unlimited")) {
    return NextResponse.json(
      { error: "Free plan allows only 1 goal. Upgrade to Plus for unlimited." },
      { status: 402 },
    );
  }

  const { name, type, target, deadline } = body;
  if (!name || !target) {
    return NextResponse.json({ error: "Name and target required." }, { status: 400 });
  }
  const targetAmt = Number(target);
  // assume 6 month default if no deadline
  const dl = deadline ? new Date(deadline) : null;
  const months = dl
    ? Math.max(1, Math.round((dl.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)))
    : 6;
  const monthlyTarget = +(targetAmt / months).toFixed(2);
  const weeklyTarget = +(monthlyTarget / 4.33).toFixed(2);

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      name,
      type,
      targetAmount: targetAmt,
      monthlyTarget,
      weeklyTarget,
      deadline: dl,
    },
  });
  return NextResponse.json({ id: goal.id });
}
