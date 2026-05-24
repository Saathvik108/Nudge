import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { canAccess } from "@/lib/plan";
import { PageHeader } from "@/components/PageHeader";
import { Stat } from "@/components/Stat";
import { UpgradeCard } from "@/components/UpgradeCard";
import { usd } from "@/lib/format";

const SCRIPTS: Record<string, { steps: string[]; tip: string }> = {
  internet: {
    steps: [
      "Call your provider and ask for the loyalty/retention department by name. Don't argue with the first rep.",
      "Say: \"Hi, I'm reviewing my bills and the price for similar plans is lower elsewhere. I've been a customer for X years — what can you do to keep me?\"",
      "When they offer a discount, pause. Then say: \"That helps, but I was hoping for around $XX. Is that possible?\"",
      "If they hold firm, ask: \"What's the best you can offer if I commit for another 12 months?\"",
    ],
    tip: "Average win: $15–$30/mo. Best time to call: mid-month, late morning.",
  },
  phone: {
    steps: [
      "Check competitor prices first (Mint, Visible, US Mobile). Have a screenshot ready.",
      "Call and ask for loyalty. Mention you're considering switching to <competitor> for $X.",
      "Ask specifically about: removing line access fees, autopay discounts, employer/affiliate discounts.",
      "If they offer a credit, ask if it can be recurring instead of one-time.",
    ],
    tip: "Most people overpay by $20–$40/mo just because they never asked.",
  },
  insurance: {
    steps: [
      "Get 2 quick quotes from competitors (Progressive, Geico, Liberty Mutual) — takes 10 minutes.",
      "Call your current insurer. Say: \"I just got a quote from <competitor> for $X. Can you match or beat it?\"",
      "Ask about: bundling discounts, paid-in-full discount, low-mileage discount.",
      "If no match, switch. Loyalty rarely pays in insurance.",
    ],
    tip: "Average win when switching: $300–$600/year.",
  },
  utility: {
    steps: [
      "Most utilities aren't negotiable, but check for income-based programs or budget billing.",
      "Switch to budget billing to smooth out the bill.",
      "Check your state's utility comparison site — you may be able to choose a cheaper supplier.",
    ],
    tip: "Heat pump/insulation rebates can save more than negotiation.",
  },
  cable: {
    steps: [
      "Threaten to cut the cord. Mention specific streaming alternatives.",
      "Ask for the 'new customer' price — they often match it for 12 months.",
      "Bundle threats work: if you have internet too, ask about combining.",
    ],
    tip: "If they refuse, actually cut it. You'll save $80+/mo.",
  },
};

export default async function BillsPage() {
  const user = await getCurrentUser();
  const plan = user.plan as "free" | "plus" | "premium";
  const bills = await prisma.bill.findMany({ where: { userId: user.id } });
  const total = bills.reduce((s, b) => s + b.monthlyCost, 0);
  const negotiable = bills.filter((b) => b.negotiable);
  const negTotal = negotiable.reduce((s, b) => s + b.monthlyCost, 0);
  const canNegotiate = canAccess(plan, "bill_negotiator");

  return (
    <div>
      <PageHeader
        title="Bill Negotiator"
        subtitle="The scripts that actually work. Average call wins $20–$40/mo."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Bills total" value={`${usd(total)}/mo`} />
        <Stat
          label="Negotiable"
          value={`${usd(negTotal)}/mo`}
          hint={`${negotiable.length} of ${bills.length}`}
        />
        <Stat
          label="Potential savings"
          value={`${usd(negTotal * 0.2)}/mo`}
          hint="If you knock 20% off"
          accent="green"
        />
      </div>

      {!canNegotiate && (
        <div className="mt-6">
          <UpgradeCard
            requiredPlan="plus"
            feature="Personalized negotiation scripts"
            pitch="Plus unlocks the exact word-for-word scripts (with the loyalty numbers and competitor prices) for each of your bills. One phone call usually saves more than a year of Plus."
          />
        </div>
      )}

      <div className="space-y-4 mt-6">
        {bills.map((b) => (
          <div key={b.id} className="card-pad">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase font-medium text-ink-500">
                  {b.category}
                </div>
                <h3 className="text-lg font-semibold mt-1">{b.name}</h3>
                <div className="text-sm text-ink-600">{usd(b.monthlyCost)} / month</div>
              </div>
              <span
                className={`pill ${
                  b.negotiable
                    ? "bg-brand-50 text-brand-800"
                    : "bg-ink-100 text-ink-600"
                }`}
              >
                {b.negotiable ? "negotiable" : "fixed"}
              </span>
            </div>
            {b.negotiable && canNegotiate && SCRIPTS[b.category] && (
              <div className="mt-4 rounded-xl bg-ink-50 p-4">
                <div className="stat-label mb-2">The script</div>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {SCRIPTS[b.category].steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
                <div className="mt-3 text-xs text-ink-600 italic">
                  💡 {SCRIPTS[b.category].tip}
                </div>
              </div>
            )}
            {b.negotiable && !canNegotiate && (
              <p className="text-sm text-ink-500 mt-3">
                Script available on Plus.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
