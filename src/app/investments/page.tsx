import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { canAccess } from "@/lib/plan";
import { PageHeader } from "@/components/PageHeader";
import { Stat } from "@/components/Stat";
import { UpgradeCard } from "@/components/UpgradeCard";
import { ProgressBar } from "@/components/ProgressBar";
import { usd, pct } from "@/lib/format";

export default async function InvestmentsPage() {
  const user = await getCurrentUser();
  const plan = user.plan as "free" | "plus" | "premium";
  const holdings = await prisma.investment.findMany({
    where: { userId: user.id },
    orderBy: { currentValue: "desc" },
  });

  const cost = holdings.reduce((s, h) => s + h.costBasis, 0);
  const value = holdings.reduce((s, h) => s + h.currentValue, 0);
  const gain = value - cost;
  const gainPct = cost > 0 ? gain / cost : 0;

  const canTrack = canAccess(plan, "investment_tracker");

  return (
    <div>
      <PageHeader
        title="Investment Tracker"
        subtitle="Net worth view. Your money working while you sleep."
      />

      {!canTrack ? (
        <UpgradeCard
          requiredPlan="premium"
          feature="Investment Tracker"
          pitch="Premium connects your brokerage accounts, shows your portfolio, and adds your investments to your net worth alongside savings and debt."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Stat label="Portfolio value" value={usd(value)} hint={`${holdings.length} holdings`} />
            <Stat label="Cost basis" value={usd(cost)} />
            <Stat
              label="Gain / loss"
              value={`${gain >= 0 ? "+" : ""}${usd(gain)}`}
              hint={pct(gainPct, 2)}
              accent={gain >= 0 ? "green" : "red"}
            />
          </div>

          <div className="card-pad mt-6">
            <div className="stat-label">Holdings</div>
            <div className="mt-3 divide-y divide-ink-100">
              {holdings.map((h) => {
                const ret = ((h.currentValue - h.costBasis) / h.costBasis) * 100;
                return (
                  <div key={h.id} className="py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium">
                          {h.ticker} <span className="text-ink-500 font-normal">· {h.name}</span>
                        </div>
                        <div className="text-xs text-ink-500">
                          {h.shares} shares · cost {usd(h.costBasis)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{usd(h.currentValue)}</div>
                        <div
                          className={`text-xs ${
                            ret >= 0 ? "text-brand-700" : "text-red-600"
                          }`}
                        >
                          {ret >= 0 ? "+" : ""}{ret.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <ProgressBar
                      className="mt-2"
                      value={h.currentValue}
                      max={holdings[0].currentValue}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
