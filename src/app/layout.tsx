import "./globals.css";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { SetupScreen } from "@/components/SetupScreen";
import { getCurrentUserSafe } from "@/lib/current-user";

export const metadata: Metadata = {
  title: "Nudge — money on autopilot",
  description:
    "No spreadsheets. No complicated budgets. Just simple, automatic money management that works in the background of your life.",
};

// Every route is per-user and DB-backed; never statically prerender.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const load = await getCurrentUserSafe();
  return (
    <html lang="en">
      <body>
        {load.ok ? (
          <div className="flex min-h-screen">
            <Sidebar userName={load.user.name} userPlan={load.user.plan} />
            <div className="flex flex-1 flex-col min-w-0">
              <TopBar streak={load.user.currentStreak} plan={load.user.plan} />
              <main className="flex-1 px-4 lg:px-8 py-6 max-w-6xl w-full mx-auto">
                {children}
              </main>
            </div>
          </div>
        ) : (
          <SetupScreen reason={load.reason} detail={load.detail} />
        )}
      </body>
    </html>
  );
}
