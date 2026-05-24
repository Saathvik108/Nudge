import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { canAccess } from "@/lib/plan";
import { PageHeader } from "@/components/PageHeader";
import { Stat } from "@/components/Stat";
import { UpgradeCard } from "@/components/UpgradeCard";
import { usd, shortDate } from "@/lib/format";
import { ClaimButton } from "./ClaimButton";

const STATUS_STYLES: Record<string, string> = {
  found: "bg-orange-50 text-orange-700",
  claimed: "bg-blue-50 text-blue-700",
  received: "bg-brand-50 text-brand-800",
};

export default async function RefundsPage() {
  const user = await getCurrentUser();
  const plan = user.plan as "free" | "plus" | "premium";
  const refunds = await prisma.refund.findMany({
    where: { userId: user.id },
    orderBy: { foundAt: "desc" },
  });
  const canHunt = canAccess(plan, "refund_hunter");

  if (!canHunt) {
    return (
      <div>
        <PageHeader
          title="Refund Hunter"
          subtitle="Get money back when prices drop after you bought."
        />
        <UpgradeCard
          requiredPlan="premium"
          feature="Refund Hunter"
          pitch="Premium scans your recent purchases and watches for price drops. When it finds one, it gives you a one-tap claim. Average user gets back $80–$200/year."
        />
      </div>
    );
  }

  const totalFound = refunds.reduce((s, r) => s + r.amount, 0);
  const received = refunds
    .filter((r) => r.status === "received")
    .reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <PageHeader
        title="Refund Hunter"
        subtitle="Found money. Claim it before the window closes."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Found" value={usd(totalFound)} accent="green" />
        <Stat label="Received" value={usd(received)} accent="green" />
        <Stat label="Claims" value={`${refunds.length} items`} />
      </div>

      <div className="space-y-3 mt-6">
        {refunds.map((r) => (
          <div key={r.id} className="card-pad">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase font-medium text-ink-500">{r.merchant}</div>
                <h3 className="font-semibold mt-1">{r.item}</h3>
                <div className="text-xs text-ink-500 mt-1">
                  Paid {usd(r.originalPrice)} · now {usd(r.newPrice)} · found {shortDate(r.foundAt)}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl font-semibold text-brand-700">+{usd(r.amount)}</div>
                <span className={`pill mt-2 ${STATUS_STYLES[r.status]}`}>
                  {r.status}
                </span>
                {r.status === "found" && <div className="mt-2"><ClaimButton id={r.id} /></div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
