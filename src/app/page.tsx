import Link from "next/link";
import { Flame, Target, MessageCircle, TrendingDown, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { Stat } from "@/components/Stat";
import { ProgressBar } from "@/components/ProgressBar";
import { usd, pct, shortDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const recent = await prisma.transaction.findMany({
    where: { userId: user.id, date: { gte: since } },
    orderBy: { date: "desc" },
  });
  const spent = recent
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const earned = recent
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);

  const byCat: Record<string, number> = {};
  for (const t of recent) {
    if (t.amount >= 0) continue;
    byCat[t.category] = (byCat[t.category] ?? 0) + Math.abs(t.amount);
  }
  const top = Object.entries(byCat)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const goals = await prisma.goal.findMany({ where: { userId: user.id, active: true } });
  const goal = goals[0];

  const debts = await prisma.debt.findMany({ where: { userId: user.id } });
  const debtTotal = debts.reduce((s, d) => s + d.balance, 0);

  const subs = await prisma.subscription.findMany({
    where: { userId: user.id, cancelled: false },
  });
  const subTotal = subs.reduce((s, x) => s + x.amount, 0);
  const wasted = subs.filter((s) => !s.usedRecently).reduce((s, x) => s + x.amount, 0);

  const savingsRate = earned > 0 ? Math.max(0, (earned - spent) / earned) : 0;

  return (
    <div>
      <PageHeader
        title={`Hey ${user.name} 👋`}
        subtitle={`Day ${user.currentStreak} streak — keep it rolling.`}
      />

      {/* Hero summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          label="Saved (30d)"
          value={usd(Math.max(0, earned - spent))}
          hint={`Savings rate ${pct(savingsRate, 1)}`}
          accent="green"
        />
        <Stat label="Spent (30d)" value={usd(spent)} hint={`${recent.length} transactions`} />
        <Stat label="Total debt" value={usd(debtTotal)} hint={`${debts.length} accounts`} accent="red" />
        <Stat
          label="Subscriptions"
          value={usd(subTotal) + "/mo"}
          hint={`${usd(wasted)}/mo unused`}
        />
      </div>

      {/* Main row */}
      <div className="grid gap-4 mt-6 lg:grid-cols-3">
        {/* Goal */}
        <div className="card-pad lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="stat-label flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" /> Primary goal
              </div>
              <h2 className="mt-1 text-xl font-semibold">{goal?.name ?? "Set your first goal"}</h2>
            </div>
            <Link href="/goals" className="btn-secondary">View <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {goal ? (
            <>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-2xl font-semibold">{usd(goal.currentAmount)}</span>
                <span className="text-sm text-ink-500">/ {usd(goal.targetAmount)}</span>
                <span className="ml-auto text-sm font-medium text-brand-700">
                  {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                </span>
              </div>
              <ProgressBar
                className="mt-2"
                value={goal.currentAmount}
                max={goal.targetAmount}
              />
              <div className="mt-3 text-sm text-ink-600">
                Weekly target: <strong>{usd(goal.weeklyTarget)}</strong>
                {goal.deadline ? <> · by {shortDate(goal.deadline)}</> : null}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-ink-600">No goal yet. Pick one and Max breaks it into bites.</p>
          )}
        </div>

        {/* Streak */}
        <div className="card-pad bg-gradient-to-br from-orange-50 to-white border-orange-200/60">
          <div className="stat-label flex items-center gap-1.5 text-orange-700">
            <Flame className="h-3.5 w-3.5" /> Streak
          </div>
          <div className="mt-1 text-3xl font-semibold text-orange-600">
            {user.currentStreak} <span className="text-base font-normal text-ink-500">days</span>
          </div>
          <div className="mt-1 text-sm text-ink-600">Longest: {user.longestStreak} days · {user.xp} XP</div>
          <Link href="/streak" className="btn-secondary mt-3 w-full">See badges</Link>
        </div>
      </div>

      {/* Categories + transactions */}
      <div className="grid gap-4 mt-6 lg:grid-cols-3">
        <div className="card-pad lg:col-span-1">
          <div className="stat-label">Top categories (30d)</div>
          <div className="mt-3 space-y-3">
            {top.map((c) => (
              <div key={c.category}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{c.category}</span>
                  <span className="text-ink-600">{usd(c.amount)}</span>
                </div>
                <ProgressBar
                  className="mt-1"
                  value={c.amount}
                  max={top[0].amount}
                />
              </div>
            ))}
            {top.length === 0 && <p className="text-sm text-ink-500">No spending in this period.</p>}
          </div>
          <Link href="/spending" className="btn-secondary mt-4 w-full">
            Open Spend Analyzer
          </Link>
        </div>

        <div className="card-pad lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="stat-label">Recent transactions</div>
            <Link href="/spending" className="text-xs text-brand-700 hover:underline">View all</Link>
          </div>
          <div className="mt-3 divide-y divide-ink-100">
            {recent.slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2.5">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{t.merchant}</div>
                  <div className="text-xs text-ink-500">
                    {t.category} · {shortDate(t.date)}
                  </div>
                </div>
                <div className={`text-sm font-medium ${t.amount > 0 ? "text-brand-700" : "text-ink-900"}`}>
                  {t.amount > 0 ? "+" : ""}{usd(t.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 mt-6 sm:grid-cols-3">
        <Link href="/chat" className="card-pad hover:shadow-lg transition">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-100 text-brand-700 grid place-items-center">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium">Talk to Max</div>
              <div className="text-xs text-ink-500">Daily check-in, money questions</div>
            </div>
          </div>
        </Link>
        <Link href="/subscriptions" className="card-pad hover:shadow-lg transition">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-700 grid place-items-center">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium">Kill subscriptions</div>
              <div className="text-xs text-ink-500">{usd(wasted)}/mo unused detected</div>
            </div>
          </div>
        </Link>
        <Link href="/report" className="card-pad hover:shadow-lg transition">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 grid place-items-center">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium">Weekly report</div>
              <div className="text-xs text-ink-500">Your money, in one screen</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
