import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { Stat } from "@/components/Stat";
import { UpgradeCard } from "@/components/UpgradeCard";
import { canAccess } from "@/lib/plan";
import { usd, shortDate } from "@/lib/format";
import { TrendingUp, AlertTriangle } from "lucide-react";

export default async function SpendingPage() {
  const user = await getCurrentUser();
  const plan = user.plan as "free" | "plus" | "premium";

  const windowDays = canAccess(plan, "spending_history_90") ? 90 : 30;
  const since = new Date();
  since.setDate(since.getDate() - windowDays);

  const txs = await prisma.transaction.findMany({
    where: { userId: user.id, date: { gte: since } },
    orderBy: { date: "desc" },
  });

  const spent = txs.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const earned = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const emotionalSpend = txs
    .filter((t) => t.emotional && t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const byCat: Record<string, { amount: number; count: number }> = {};
  for (const t of txs) {
    if (t.amount >= 0) continue;
    if (!byCat[t.category]) byCat[t.category] = { amount: 0, count: 0 };
    byCat[t.category].amount += Math.abs(t.amount);
    byCat[t.category].count += 1;
  }
  const cats = Object.entries(byCat)
    .map(([k, v]) => ({ category: k, ...v }))
    .sort((a, b) => b.amount - a.amount);

  const max = cats[0]?.amount ?? 1;

  return (
    <div>
      <PageHeader
        title="Spend Analyzer"
        subtitle={`${windowDays}-day window · ${txs.length} transactions`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Spent" value={usd(spent)} hint={`Daily avg ${usd(spent / windowDays)}`} />
        <Stat label="Earned" value={usd(earned)} accent="green" />
        <Stat
          label="Impulse-flagged"
          value={usd(emotionalSpend)}
          hint="Late-night orders, repeat retail"
          accent="red"
        />
      </div>

      {!canAccess(plan, "spending_history_90") && (
        <div className="mt-6">
          <UpgradeCard
            requiredPlan="plus"
            feature="See 90+ days of spending"
            pitch="Unlock 3 months of patterns. Most users find $200–$400/month they didn't know they were wasting."
          />
        </div>
      )}

      <div className="grid gap-4 mt-6 lg:grid-cols-3">
        <div className="card-pad lg:col-span-1">
          <div className="stat-label flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Categories
          </div>
          <div className="mt-3 space-y-3">
            {cats.map((c) => (
              <div key={c.category}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{c.category}</span>
                  <span className="text-ink-600">{usd(c.amount)}</span>
                </div>
                <ProgressBar className="mt-1" value={c.amount} max={max} />
                <div className="text-xs text-ink-500 mt-1">{c.count} transactions</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-pad lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="stat-label">All transactions</div>
            {emotionalSpend > 0 && (
              <span className="pill bg-orange-50 text-orange-700">
                <AlertTriangle className="h-3 w-3" /> {usd(emotionalSpend)} flagged
              </span>
            )}
          </div>
          <div className="mt-3 divide-y divide-ink-100 max-h-[600px] overflow-y-auto">
            {txs.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2.5">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {t.merchant}
                    {t.emotional && (
                      <span className="ml-2 pill bg-orange-50 text-orange-700">flagged</span>
                    )}
                  </div>
                  <div className="text-xs text-ink-500">
                    {t.category} · {shortDate(t.date)}
                  </div>
                </div>
                <div
                  className={`text-sm font-medium ${
                    t.amount > 0 ? "text-brand-700" : "text-ink-900"
                  }`}
                >
                  {t.amount > 0 ? "+" : ""}
                  {usd(t.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
