import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "red",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  tone?: "red" | "green" | "amber" | "blue" | "purple";
}) {
  const tiles: Record<string, string> = {
    red: "bg-red-50 text-red-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-moss/30 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-3">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tiles[tone]}`}>
          <Icon className="h-[1.125rem] w-[1.125rem]" />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-semibold tabular-nums text-ink">{value}</p>
        {sub && <p className="mt-1 text-xs text-ink-3">{sub}</p>}
      </div>
    </div>
  );
}
