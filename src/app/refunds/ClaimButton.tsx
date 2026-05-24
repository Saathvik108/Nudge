"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export const ClaimButton = ({ id }: { id: string }) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const claim = async () => {
    setPending(true);
    const res = await fetch(`/api/refunds/${id}/claim`, { method: "POST" });
    setPending(false);
    if (res.ok) router.refresh();
  };
  return (
    <button onClick={claim} disabled={pending} className="btn-primary text-xs">
      {pending ? "Claiming…" : "Claim"}
    </button>
  );
};
