import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const r = await prisma.refund.findFirst({
    where: { id: params.id, userId: user.id },
  });
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.refund.update({
    where: { id: r.id },
    data: { status: "claimed" },
  });
  return NextResponse.json({ ok: true });
}
