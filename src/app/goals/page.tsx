import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { UpgradeCard } from "@/components/UpgradeCard";
import { canAccess } from "@/lib/plan";
import { usd, shortDate, daysBetween } from "@/lib/format";
import { GoalForm } from "./GoalForm";

export default async function GoalsPage() {
  const user = await getCurrentUser();
  const plan = user.plan as "free" | "plus" | "premium";
  const goals = await prisma.goal.findMany({
    where: { userId: user.id, active: true },
    orderBy: { createdAt: "asc" },
  });
  const canAddMore = canAccess(plan, "goal_unlimited") || goals.length === 0;

  return (
    <div>
      <PageHeader
        title="Goal Tracker"
        subtitle="One bite at a time. Max breaks goals into weekly chunks."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((g) => {
          const pctVal = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
          const remaining = Math.max(0, g.targetAmount - g.currentAmount);
          const daysLeft = g.deadline
            ? daysBetween(new Date(), new Date(g.deadline))
            : null;
          return (
            <div key={g.id} className="card-pad">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-medium uppercase text-ink-500">{g.type}</div>
                  <h3 className="mt-1 text-xl font-semibold">{g.name}</h3>
                </div>
                <span className="pill bg-brand-50 text-brand-800">
                  {Math.round(pctVal)}%
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{usd(g.currentAmount)}</span>
                <span className="text-sm text-ink-500">/ {usd(g.targetAmount)}</span>
              </div>
              <ProgressBar className="mt-2" value={g.currentAmount} max={g.targetAmount} />
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-ink-500">Weekly</div>
                  <div className="font-semibold">{usd(g.weeklyTarget)}</div>
                </div>
                <div>
                  <div className="text-ink-500">Monthly</div>
                  <div className="font-semibold">{usd(g.monthlyTarget)}</div>
                </div>
                <div>
                  <div className="text-ink-500">Remaining</div>
                  <div className="font-semibold">{usd(remaining)}</div>
                </div>
              </div>
              {g.deadline && (
                <div className="mt-3 text-xs text-ink-500">
                  Target {shortDate(g.deadline)} · {daysLeft} days left
                </div>
              )}
            </div>
          );
        })}
      </div>

      {canAddMore ? (
        <div className="mt-6">
          <GoalForm />
        </div>
      ) : (
        <div className="mt-6">
          <UpgradeCard
            requiredPlan="plus"
            feature="Unlimited goals"
            pitch={`You're crushing ${goals[0]?.name ?? "your goal"} — adding another is a Plus thing. $7/mo unlocks unlimited goals, debt destroyer, and the subscription killer.`}
          />
        </div>
      )}
    </div>
  );
}
