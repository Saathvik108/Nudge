import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { canAccess } from "@/lib/plan";
import { PageHeader } from "@/components/PageHeader";
import { Stat } from "@/components/Stat";
import { UpgradeCard } from "@/components/UpgradeCard";
import { usd, shortDate } from "@/lib/format";

export default async function PaycheckPage() {
  const user = await getCurrentUser();
  const plan = user.plan as "free" | "plus" | "premium";
  const paychecks = await prisma.paycheck.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 6,
  });

  const canPlan = canAccess(plan, "paycheck_planner");

  if (!canPlan) {
    return (
      <div>
        <PageHeader
          title="Paycheck Planner"
          subtitle="Allocate every dollar before you can spend it."
        />
        <UpgradeCard
          requiredPlan="premium"
          feature="Paycheck Planner"
          pitch="Premium splits every paycheck the moment it lands: needs, wants, goals. Auto-save is scheduled before you see the money. It's the difference between trying to save and actually saving."
        />
      </div>
    );
  }

  const next = paychecks[0];
  const needs = next ? next.amount * next.needsPct : 0;
  const wants = next ? next.amount * next.wantsPct : 0;
  const goals = next ? next.amount * next.goalsPct : 0;

  return (
    <div>
      <PageHeader
        title="Paycheck Planner"
        subtitle="Every dollar gets a job, the second it lands."
      />

      {next && (
        <div className="card-pad bg-gradient-to-br from-brand-50 to-white border-brand-200">
          <div className="stat-label">Last paycheck</div>
          <div className="mt-1 text-3xl font-semibold">{usd(next.amount)}</div>
          <div className="text-xs text-ink-500">{shortDate(next.date)}</div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div>
              <div className="stat-label">✅ Needs (50%)</div>
              <div className="font-semibold mt-1">{usd(needs)}</div>
            </div>
            <div>
              <div className="stat-label">🎉 Wants (30%)</div>
              <div className="font-semibold mt-1">{usd(wants)}</div>
            </div>
            <div>
              <div className="stat-label">🚀 Goals (20%)</div>
              <div className="font-semibold mt-1">{usd(goals)}</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-ink-700">
            Auto-saved: <strong>{usd(next.autoSaved)}</strong>. Daily fun budget: <strong>{usd(wants / 14)}</strong>.
          </div>
        </div>
      )}

      <div className="card-pad mt-6">
        <div className="stat-label">Recent paychecks</div>
        <div className="mt-3 divide-y divide-ink-100">
          {paychecks.map((p) => (
            <div key={p.id} className="py-3 flex justify-between text-sm">
              <span className="text-ink-500">{shortDate(p.date)}</span>
              <span className="font-medium">{usd(p.amount)}</span>
              <span className="text-brand-700">+{usd(p.autoSaved)} saved</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <Stat
          label="Avg saved / paycheck"
          value={usd(paychecks.reduce((s, p) => s + p.autoSaved, 0) / Math.max(1, paychecks.length))}
          accent="green"
        />
        <Stat
          label="Pay frequency"
          value="Bi-weekly"
        />
        <Stat
          label="Total auto-saved (90d)"
          value={usd(paychecks.reduce((s, p) => s + p.autoSaved, 0))}
          accent="green"
        />
      </div>
    </div>
  );
}
