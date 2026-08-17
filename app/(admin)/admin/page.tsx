"use client";

import { Users, Receipt, CheckCircle2, Clock, XCircle, Wallet } from "lucide-react";
import { useAdminStats } from "@/hooks/admin/useAdminStats";
import { StatCard } from "@/components/ui/StatCard";
import { formatMoney } from "@/lib/format";

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <div>
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
          Admin
        </span>
        <h1 className="mt-3 font-display text-3xl text-ink">Overview</h1>
        <p className="mt-1.5 text-sm text-ink-3">A snapshot of Npay right now.</p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-line" />
          ))}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard icon={Users} label="Total users" value={stats.total_users} />
          <StatCard icon={Receipt} label="Total transactions" value={stats.total_transactions} />
          <StatCard icon={CheckCircle2} label="Successful payments" value={stats.successful_payments} tone="green" />
          <StatCard icon={Clock} label="Pending / processing" value={stats.pending_payments} tone="amber" />
          <StatCard icon={XCircle} label="Failed payments" value={stats.failed_payments} tone="red" />
          <StatCard
            icon={Wallet}
            label="Total revenue"
            value={formatMoney(stats.total_revenue_npr, "NPR")}
            tone="green"
          />
          {stats.khalti_balance && (
            <StatCard
              icon={Wallet}
              label="Khalti wallet balance"
              value={formatMoney(stats.khalti_balance.credits_available, "NPR")}
              tone="purple"
            />
          )}
        </div>
      )}
    </div>
  );
}
