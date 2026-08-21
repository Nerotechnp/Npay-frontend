"use client";

import type { LucideIcon } from "lucide-react";

export interface StatProps {
  label: string;
  value: string;
  icon: LucideIcon;
  gradient: string;
  hint?: string;
  trend?: { value: string; positive: boolean };
}

export function StatCard({ label, value, icon: Icon, gradient, hint, trend }: StatProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5">
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 transition-opacity duration-300 group-hover:opacity-20 ${gradient}`}
      />
      <div className="relative flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm ${gradient}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={`text-[11px] font-semibold ${trend.positive ? "text-emerald-600" : "text-rose-600"}`}
          >
            {trend.positive ? "▲" : "▼"} {trend.value}
          </span>
        )}
      </div>
      <p className="relative mt-4 text-2xl font-bold tracking-tight text-ink">{value}</p>
      <p className="relative mt-0.5 text-[13px] text-ink-3">{label}</p>
      {hint && <p className="relative mt-1 text-[11px] text-ink-3/80">{hint}</p>}
    </div>
  );
}
