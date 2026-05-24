"use client";

import Link from "next/link";
import { Flame } from "lucide-react";

export const TopBar = ({
  streak, plan,
}: { streak: number; plan: string }) => {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-ink-100 bg-white/80 backdrop-blur px-4 lg:px-8 py-3">
      <Link href="/" className="lg:hidden flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-brand-600 grid place-items-center text-white font-bold text-sm">N</div>
        <span className="font-semibold">Nudge</span>
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <span className="pill bg-orange-50 text-orange-700">
          <Flame className="h-3.5 w-3.5" /> {streak}-day streak
        </span>
        <Link
          href="/settings"
          className="pill bg-brand-50 text-brand-800 capitalize"
        >
          {plan} plan
        </Link>
      </div>
    </header>
  );
};
