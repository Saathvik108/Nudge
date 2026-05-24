"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GOAL_TYPES = [
  { value: "emergency", label: "Emergency fund" },
  { value: "vacation", label: "Vacation" },
  { value: "home", label: "Home down payment" },
  { value: "car", label: "Car" },
  { value: "wedding", label: "Wedding" },
  { value: "invest", label: "Investment starter" },
  { value: "fyou", label: "F-you fund" },
  { value: "custom", label: "Something else" },
];

export const GoalForm = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("vacation");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target) return;
    setPending(true);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, target: Number(target), deadline }),
    });
    setPending(false);
    if (res.ok) {
      setName("");
      setTarget("");
      setDeadline("");
      router.refresh();
    }
  };

  return (
    <form onSubmit={submit} className="card-pad">
      <h3 className="text-lg font-semibold">Add a goal</h3>
      <p className="text-sm text-ink-500 mt-1">Pick something concrete. We'll break it down.</p>
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <input
          className="input"
          placeholder="Name (e.g. Tokyo trip)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          {GOAL_TYPES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input
          className="input"
          type="number"
          min="1"
          placeholder="Target amount ($)"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          required
        />
        <input
          className="input"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>
      <button type="submit" disabled={pending} className="btn-primary mt-4">
        {pending ? "Saving…" : "Add goal"}
      </button>
    </form>
  );
};
