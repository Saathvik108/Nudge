import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { PageHeader } from "@/components/PageHeader";
import { PLAN_LABELS, PLAN_PRICES, PLAN_FEATURES, FEATURE_INFO } from "@/lib/plan";
import { PlanSwitcher } from "./PlanSwitcher";
import { Check } from "lucide-react";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const counts = {
    accounts: await prisma.account.count({ where: { userId: user.id } }),
    goals: await prisma.goal.count({ where: { userId: user.id, active: true } }),
    transactions: await prisma.transaction.count({ where: { userId: user.id } }),
  };

  const plans: ("free" | "plus" | "premium")[] = ["free", "plus", "premium"];

  return (
    <div>
      <PageHeader title="Plan & Settings" subtitle="Switch plans freely — this is a demo." />

      <div className="card-pad">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-brand-100 text-brand-800 grid place-items-center text-xl font-semibold">
            {user.name[0]}
          </div>
          <div>
            <div className="text-xl font-semibold">{user.name}</div>
            <div className="text-sm text-ink-500">{user.email} · age {user.age}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5 text-sm">
          <div>
            <div className="stat-label">Accounts</div>
            <div className="font-semibold mt-1">{counts.accounts}</div>
          </div>
          <div>
            <div className="stat-label">Active goals</div>
            <div className="font-semibold mt-1">{counts.goals}</div>
          </div>
          <div>
            <div className="stat-label">Transactions</div>
            <div className="font-semibold mt-1">{counts.transactions}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-8">
        {plans.map((p) => {
          const current = user.plan === p;
          const features = PLAN_FEATURES[p];
          return (
            <div
              key={p}
              className={`card-pad ${current ? "border-brand-500 ring-2 ring-brand-100" : ""}`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold">{PLAN_LABELS[p]}</h3>
                <span className="text-sm text-ink-600">{PLAN_PRICES[p]}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                    <span>{FEATURE_INFO[f].name}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <PlanSwitcher target={p} current={user.plan as any} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
