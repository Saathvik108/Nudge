"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export const CancelButton = ({ id, disabled }: { id: string; disabled?: boolean }) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const cancel = async () => {
    if (disabled || pending) return;
    setPending(true);
    const res = await fetch(`/api/subscriptions/${id}/cancel`, { method: "POST" });
    setPending(false);
    if (res.ok) router.refresh();
  };

  return (
    <button
      onClick={cancel}
      disabled={disabled || pending}
      className="mt-1 text-xs font-medium text-brand-700 hover:underline disabled:text-ink-400 disabled:no-underline"
    >
      {disabled ? "Upgrade to cancel" : pending ? "Cancelling…" : "Cancel"}
    </button>
  );
};
