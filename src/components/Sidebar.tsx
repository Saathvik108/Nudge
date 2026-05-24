"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, MessageCircle, BarChart3, Target, CreditCard, Repeat,
  Phone, LineChart, DollarSign, Tag, Flame, FileText, Settings,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/chat", label: "Chat with Max", icon: MessageCircle },
  { href: "/spending", label: "Spend Analyzer", icon: BarChart3 },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/debts", label: "Debt Destroyer", icon: CreditCard },
  { href: "/subscriptions", label: "Subscriptions", icon: Repeat },
  { href: "/bills", label: "Bill Negotiator", icon: Phone },
  { href: "/investments", label: "Investments", icon: LineChart },
  { href: "/paycheck", label: "Paycheck Planner", icon: DollarSign },
  { href: "/refunds", label: "Refund Hunter", icon: Tag },
  { href: "/streak", label: "Streak & Badges", icon: Flame },
  { href: "/report", label: "Weekly Report", icon: FileText },
  { href: "/settings", label: "Plan & Settings", icon: Settings },
];

export const Sidebar = ({
  userName, userPlan,
}: { userName: string; userPlan: string }) => {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-ink-100 bg-white">
      <div className="px-5 py-5 border-b border-ink-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-brand-600 grid place-items-center text-white font-bold">N</div>
          <div>
            <div className="text-lg font-semibold leading-none">Nudge</div>
            <div className="text-xs text-ink-500 mt-0.5">money on autopilot</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                active
                  ? "bg-brand-50 text-brand-800 font-medium"
                  : "text-ink-700 hover:bg-ink-100"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-brand-600" : "text-ink-500")} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-ink-100">
        <Link href="/settings" className="block rounded-xl p-3 hover:bg-ink-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-800 grid place-items-center font-semibold">
              {userName[0]}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{userName}</div>
              <div className="text-xs text-ink-500 capitalize">{userPlan} plan</div>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
};
