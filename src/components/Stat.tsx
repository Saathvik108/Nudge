import { cn } from "@/lib/cn";

export const Stat = ({
  label, value, hint, className, accent,
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
  accent?: "green" | "red" | "neutral";
}) => (
  <div className={cn("card-pad", className)}>
    <div className="stat-label">{label}</div>
    <div
      className={cn(
        "stat-value",
        accent === "green" && "text-brand-700",
        accent === "red" && "text-red-600"
      )}
    >
      {value}
    </div>
    {hint ? <div className="mt-1 text-xs text-ink-500">{hint}</div> : null}
  </div>
);
