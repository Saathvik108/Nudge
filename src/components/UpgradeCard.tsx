import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PLAN_PRICES, type Plan } from "@/lib/plan";

export const UpgradeCard = ({
  requiredPlan,
  feature,
  pitch,
}: {
  requiredPlan: Plan;
  feature: string;
  pitch: string;
}) => (
  <div className="card-pad border-brand-200 bg-gradient-to-br from-brand-50 to-white">
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-xl bg-brand-600 text-white grid place-items-center">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {requiredPlan === "plus" ? "Plus feature" : "Premium feature"} · {PLAN_PRICES[requiredPlan]}
        </div>
        <h3 className="mt-1 text-lg font-semibold">{feature}</h3>
        <p className="text-sm text-ink-700 mt-1 leading-relaxed">{pitch}</p>
        <Link
          href="/settings"
          className="btn-primary mt-3"
        >
          Upgrade to {requiredPlan === "plus" ? "Plus" : "Premium"}
        </Link>
      </div>
    </div>
  </div>
);
