"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/plan";

export const PlanSwitcher = ({
  target, current,
}: { target: Plan; current: Plan }) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const isCurrent = target === current;

  const switchPlan = async () => {
    if (isCurrent || pending) return;
    setPending(true);
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: target }),
    });
    setPending(false);
    if (res.ok) router.refresh();
  };

  return (
    <button
      onClick={switchPlan}
      disabled={isCurrent || pending}
      className={isCurrent ? "btn-secondary w-full" : "btn-primary w-full"}
    >
      {isCurrent ? "Current plan" : pending ? "Switching…" : `Switch to ${target}`}
    </button>
  );
};
