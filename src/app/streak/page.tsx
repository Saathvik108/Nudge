import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { PageHeader } from "@/components/PageHeader";
import { Stat } from "@/components/Stat";
import { Flame } from "lucide-react";

const MILESTONES = [
  { at: 3, label: "Building a habit" },
  { at: 7, label: "One full week 🔥" },
  { at: 14, label: "Two weeks strong" },
  { at: 30, label: "A MONTH. Different now. 🏆" },
  { at: 100, label: "Legend status 🐐" },
];

export default async function StreakPage() {
  const user = await getCurrentUser();
  const allBadges = await prisma.badge.findMany();
  const earned = await prisma.userBadge.findMany({
    where: { userId: user.id },
    include: { badge: true },
  });
  const earnedIds = new Set(earned.map((e) => e.badgeId));

  const events = await prisma.streakEvent.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 30,
  });

  const nextMilestone = MILESTONES.find((m) => m.at > user.currentStreak);

  return (
    <div>
      <PageHeader title="Streak & Badges" subtitle="Show up. Stack the days. Done." />

      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          label="Current streak"
          value={`${user.currentStreak} days`}
          accent="green"
          hint={nextMilestone ? `Next: ${nextMilestone.label} at ${nextMilestone.at}` : "All milestones hit"}
        />
        <Stat label="Longest streak" value={`${user.longestStreak} days`} />
        <Stat label="XP" value={user.xp.toLocaleString()} accent="green" />
      </div>

      <div className="card-pad mt-6 bg-gradient-to-br from-orange-50 to-white border-orange-200">
        <div className="flex items-center gap-3">
          <Flame className="h-8 w-8 text-orange-500" />
          <div>
            <div className="font-semibold">Day {user.currentStreak}</div>
            <div className="text-sm text-ink-600">
              {nextMilestone
                ? `${nextMilestone.at - user.currentStreak} more days to "${nextMilestone.label}"`
                : "You are the milestone."}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
          {allBadges.map((b) => {
            const got = earnedIds.has(b.id);
            return (
              <div
                key={b.id}
                className={`card-pad text-center ${got ? "" : "opacity-40 grayscale"}`}
              >
                <div className="text-3xl">{b.emoji}</div>
                <div className="font-medium text-sm mt-2">{b.name}</div>
                <div className="text-xs text-ink-500 mt-1">{b.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        <div className="card-pad mt-3">
          <div className="divide-y divide-ink-100">
            {events.map((e) => (
              <div key={e.id} className="py-2 flex justify-between text-sm">
                <span>{e.type.replaceAll("_", " ")}</span>
                <span className="text-ink-500">
                  {new Date(e.date).toLocaleDateString("en-US", {
                    month: "short", day: "numeric",
                  })}
                </span>
                <span className="text-brand-700 font-medium">+{e.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
