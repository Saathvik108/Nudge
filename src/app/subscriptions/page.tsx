import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { canAccess } from "@/lib/plan";
import { PageHeader } from "@/components/PageHeader";
import { Stat } from "@/components/Stat";
import { UpgradeCard } from "@/components/UpgradeCard";
import { CancelButton } from "./CancelButton";
import { usd, shortDate } from "@/lib/format";

export default async function SubscriptionsPage() {
  const user = await getCurrentUser();
  const plan = user.plan as "free" | "plus" | "premium";
  const subs = await prisma.subscription.findMany({
    where: { userId: user.id },
    orderBy: [{ cancelled: "asc" }, { amount: "desc" }],
  });

  const active = subs.filter((s) => !s.cancelled);
  const total = active.reduce((s, x) => s + x.amount, 0);
  const wasted = active
    .filter((s) => !s.usedRecently)
    .reduce((s, x) => s + x.amount, 0);
  const cancelled = subs.filter((s) => s.cancelled);
  const cancelledSavings = cancelled.reduce((s, x) => s + x.amount, 0);

  const canKill = canAccess(plan, "subscription_killer");

  return (
    <div>
      <PageHeader
        title="Subscription Killer"
        subtitle="Find what you forgot. Cancel it. Get the money back."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Active total" value={`${usd(total)}/mo`} />
        <Stat
          label="Unused leak"
          value={`${usd(wasted)}/mo`}
          hint={`${usd(wasted * 12)} a year`}
          accent="red"
        />
        <Stat label="You've saved" value={`${usd(cancelledSavings)}/mo`} accent="green" />
      </div>

      {!canKill && (
        <div className="mt-6">
          <UpgradeCard
            requiredPlan="plus"
            feature="One-tap subscription cancelling"
            pitch="Plus auto-scans your transactions for hidden subscriptions and gives you a single cancel link for each. Most users find $30–80/mo they're leaking."
          />
        </div>
      )}

      <div className="card-pad mt-6">
        <div className="stat-label">Active subscriptions</div>
        <div className="mt-3 divide-y divide-ink-100">
          {active.map((s) => (
            <div key={s.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-ink-500">
                  {s.category} · last charged {s.lastCharged ? shortDate(s.lastCharged) : "—"}
                  {!s.usedRecently && (
                    <span className="ml-2 pill bg-orange-50 text-orange-700">unused</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold">{usd(s.amount)}/mo</div>
                <CancelButton id={s.id} disabled={!canKill} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {cancelled.length > 0 && (
        <div className="card-pad mt-6 opacity-80">
          <div className="stat-label">Killed 🗡️</div>
          <div className="mt-3 space-y-2">
            {cancelled.map((s) => (
              <div key={s.id} className="text-sm flex justify-between">
                <span className="line-through text-ink-500">{s.name}</span>
                <span className="text-brand-700">+{usd(s.amount)}/mo</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
