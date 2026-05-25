import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { canAccess } from "@/lib/plan";
import { PageHeader } from "@/components/PageHeader";
import { Stat } from "@/components/Stat";
import { UpgradeCard } from "@/components/UpgradeCard";
import { generatePayoffPlan } from "@/lib/debt-plan";
import { usd, pct } from "@/lib/format";
import { ProgressBar } from "@/components/ProgressBar";

export default async function DebtsPage({
  searchParams,
}: {
  searchParams: Promise<{ strategy?: string; extra?: string }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const plan = user.plan as "free" | "plus" | "premium";
  const debts = await prisma.debt.findMany({ where: { userId: user.id } });
  const total = debts.reduce((s, d) => s + d.balance, 0);
  const minSum = debts.reduce((s, d) => s + d.minPayment, 0);

  const strategy: "avalanche" | "snowball" =
    sp.strategy === "snowball" ? "snowball" : "avalanche";
  const extra = Math.max(0, Number(sp.extra ?? 100));

  const canPlan = canAccess(plan, "debt_destroyer");
  const payoff = canPlan
    ? generatePayoffPlan(
        debts.map((d) => ({
          id: d.id, name: d.name, balance: d.balance,
          apr: d.apr, minPayment: d.minPayment,
        })),
        extra,
        strategy,
      )
    : null;

  return (
    <div>
      <PageHeader
        title="Debt Destroyer"
        subtitle="Lay it all out. No judgment, just numbers."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Total debt" value={usd(total)} accent="red" />
        <Stat label="Min. payments / mo" value={usd(minSum)} />
        <Stat
          label="Avg APR"
          value={pct(debts.reduce((s, d) => s + d.apr, 0) / Math.max(1, debts.length), 1)}
        />
      </div>

      <div className="card-pad mt-6">
        <div className="stat-label">Your debts</div>
        <div className="mt-3 divide-y divide-ink-100">
          {debts.map((d) => (
            <div key={d.id} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium">{d.name}</div>
                <div className="text-xs text-ink-500">
                  {pct(d.apr, 2)} APR · min {usd(d.minPayment)} / mo · {d.type.replaceAll("_", " ")}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{usd(d.balance)}</div>
                <div className="text-xs text-ink-500">
                  {Math.round((d.balance / total) * 100)}% of total
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!canPlan ? (
        <div className="mt-6">
          <UpgradeCard
            requiredPlan="plus"
            feature="Debt Destroyer plan"
            pitch="Get a month-by-month payoff plan with total interest saved and an exact payoff date. Avalanche or snowball — your call."
          />
          <p className="mt-3 text-sm text-ink-600">
            <strong>Free tip:</strong> list debts highest-APR to lowest, pay minimums on all, throw extra at the top. That's avalanche, and it works.
          </p>
        </div>
      ) : (
        <div className="card-pad mt-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div>
              <div className="stat-label">Strategy</div>
              <div className="mt-1 flex gap-2">
                <a
                  href={`/debts?strategy=avalanche&extra=${extra}`}
                  className={`btn ${strategy === "avalanche" ? "btn-primary" : "btn-secondary"}`}
                >
                  Avalanche
                </a>
                <a
                  href={`/debts?strategy=snowball&extra=${extra}`}
                  className={`btn ${strategy === "snowball" ? "btn-primary" : "btn-secondary"}`}
                >
                  Snowball
                </a>
              </div>
            </div>
            <form className="ml-auto" method="get" action="/debts">
              <input type="hidden" name="strategy" value={strategy} />
              <div className="flex items-end gap-2">
                <div>
                  <label className="stat-label">Extra / month</label>
                  <input
                    name="extra"
                    type="number"
                    min="0"
                    step="25"
                    defaultValue={extra}
                    className="input mt-1 w-32"
                  />
                </div>
                <button type="submit" className="btn-secondary">Recalc</button>
              </div>
            </form>
          </div>

          {payoff && (
            <>
              <div className="grid gap-4 md:grid-cols-3 mt-5">
                <Stat
                  label="Payoff in"
                  value={`${payoff.totalMonths} mo`}
                  hint={payoff.payoffDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  accent="green"
                />
                <Stat label="Total interest" value={usd(payoff.totalInterest)} accent="red" />
                <Stat label="Total paid" value={usd(payoff.totalPaid)} />
              </div>

              <div className="mt-5">
                <div className="stat-label mb-2">Per-debt payoff</div>
                <div className="space-y-3">
                  {payoff.perDebt.map((p) => (
                    <div key={p.debtId}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{p.debtName}</span>
                        <span className="text-ink-600">paid off in month {p.paidOffMonth}</span>
                      </div>
                      <ProgressBar value={p.paidOffMonth} max={payoff.totalMonths} />
                      <div className="text-xs text-ink-500 mt-1">
                        Interest paid: {usd(p.interestPaid)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
