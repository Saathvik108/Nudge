import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";
import { buildUserContext } from "@/lib/max/context";
import { generateMaxReply } from "@/lib/max/responder";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "Empty message." }, { status: 400 });

  const userId = await getCurrentUserId();

  await prisma.chatMessage.create({
    data: { userId, role: "user", content: text },
  });

  const ctx = await buildUserContext(userId);
  const reply = generateMaxReply(text, ctx);

  // XP for any message + bonus for daily checkin
  const xpEarned = reply.sessionType === "daily_checkin" ? 10 : 5;
  await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: xpEarned }, lastCheckInAt: new Date() },
  });

  const saved = await prisma.chatMessage.create({
    data: {
      userId,
      role: "assistant",
      content: reply.content,
      sessionType: reply.sessionType,
      upsellTriggered: reply.upsellTriggered,
      upsellFeature: reply.upsellFeature ?? null,
    },
  });

  return NextResponse.json({
    id: saved.id,
    content: reply.content,
    sessionType: reply.sessionType,
    upsellTriggered: reply.upsellTriggered,
    upsellFeature: reply.upsellFeature,
    xpEarned,
  });
}
