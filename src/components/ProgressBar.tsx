import { cn } from "@/lib/cn";

export const ProgressBar = ({
  value, max = 100, className, color = "brand",
}: {
  value: number;
  max?: number;
  className?: string;
  color?: "brand" | "orange" | "red";
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colorClass =
    color === "orange" ? "bg-orange-500"
    : color === "red" ? "bg-red-500"
    : "bg-brand-500";
  return (
    <div className={cn("bar", className)}>
      <span className={colorClass} style={{ width: `${pct}%` }} />
    </div>
  );
};
