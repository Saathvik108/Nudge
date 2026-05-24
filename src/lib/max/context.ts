import { prisma } from "@/lib/db";
import type { MaxUserContext } from "./system-prompt";
import type { Plan } from "../plan";

export const buildUserContext = async (userId: string): Promise<MaxUserContext> => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const goals = await prisma.goal.findMany({
    where: { userId, active: true },
    orderBy: { createdAt: "asc" },
  });
  const subs = await prisma.subscription.count({
    where: { userId, cancelled: false },
  });
  const debts = await prisma.debt.findMany({ where: { userId } });
  const debtTotal = debts.reduce((s, d) => s + d.balance, 0);

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const txs = await prisma.transaction.findMany({
    where: { userId, date: { gte: since } },
  });
  const byCat: Record<string, number> = {};
  for (const t of txs) {
    if (t.amount >= 0) continue;
    byCat[t.category] = (byCat[t.category] ?? 0) + Math.abs(t.amount);
  }
  const topCategories = Object.entries(byCat)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const primaryGoal = goals[0]
    ? {
        name: goals[0].name,
        current: goals[0].currentAmount,
        target: goals[0].targetAmount,
      }
    : null;

  return {
    name: user.name,
    plan: user.plan as Plan,
    monthlyIncome: user.monthlyIncome,
    currentSavings: user.currentSavings,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    primaryGoal,
    topCategories,
    recentDebtTotal: debtTotal,
    subscriptionsActive: subs,
  };
};
