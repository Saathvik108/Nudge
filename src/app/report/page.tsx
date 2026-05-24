import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { canAccess } from "@/lib/plan";
import { PageHeader } from "@/components/PageHeader";
import { Stat } from "@/components/Stat";
import { ProgressBar } from "@/components/ProgressBar";
import { UpgradeCard } from "@/components/UpgradeCard";
import { usd, pct, shortDate } from "@/lib/format";
import { AlertTriangle, Sparkles } from "lucide-react";

export default async function ReportPage() {
  const user = await getCurrentUser();
  const plan = user.plan as "free" | "plus" | "premium";
  const detailed = canAccess(plan, "weekly_report_detailed");

  const report = await prisma.weeklyReport.findFirst({
    where: { userId: user.id },
    orderBy: { weekStart: "desc" },
  });

  if (!report) {
    return (
      <div>
        <PageHeader title="Weekly Money Report" />
        <p className="text-ink-600">No report yet — check back after your first full week.</p>
      </div>
    );
  }

  const topCats: { category: string; amount: number; change: number }[] =
    JSON.parse(report.topCategories);
  const anomalies: string[] = JSON.parse(report.anomalies);

  return (
    <div>
      <PageHeader
        title="Weekly Money Report"
        subtitle={`Week of ${shortDate(report.weekStart)}`}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Income" value={usd(report.income)} accent="green" />
        <Stat label="Spent" value={usd(report.totalSpent)} />
        <Stat label="Saved" value={usd(report.totalSaved)} accent="green" />
        <Stat label="Savings rate" value={pct(report.savingsRate, 1)} />
      </div>

      <div className="card-pad mt-6">
        <div className="stat-label">Top categories</div>
        <div className="mt-3 space-y-3">
          {topCats.map((c) => (
            <div key={c.category}>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{c.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-ink-600">{usd(c.amount)}</span>
                  {detailed && c.change !== 0 && (
                    <span
                      className={`text-xs ${
                        c.change > 0 ? "text-red-600" : "text-brand-700"
                      }`}
                    >
                      {c.change > 0 ? "↑" : "↓"} {Math.abs(c.change * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              <ProgressBar value={c.amount} max={topCats[0].amount} />
            </div>
          ))}
        </div>
      </div>

      {detailed ? (
        <>
          {anomalies.length > 0 && (
            <div className="card-pad mt-6 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
              <div className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-4 w-4" />
                <div className="stat-label text-orange-700">Anomalies</div>
              </div>
              <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                {anomalies.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}
          <div className="card-pad mt-6 border-brand-200 bg-gradient-to-br from-brand-50 to-white">
            <div className="flex items-center gap-2 text-brand-800">
              <Sparkles className="h-4 w-4" />
              <div className="stat-label text-brand-800">Max's insight</div>
            </div>
            <p className="mt-2 text-sm text-ink-800 leading-relaxed">{report.insight}</p>
            <div className="mt-4 rounded-xl bg-white border border-ink-100 p-3">
              <div className="stat-label">This week's action</div>
              <div className="text-sm font-medium mt-1">{report.actionItem}</div>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6">
          <UpgradeCard
            requiredPlan="plus"
            feature="Detailed weekly report"
            pitch="Plus adds anomaly alerts, week-over-week % changes, and a personalized action item from Max each week."
          />
        </div>
      )}
    </div>
  );
}
