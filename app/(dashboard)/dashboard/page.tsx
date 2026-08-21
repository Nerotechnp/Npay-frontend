"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/types";
import { ServiceTile, type Tile } from "@/components/Dashboard/ServiceTile";
import { RecentActivity } from "@/components/Dashboard/RecentActivity";
import { categoryMeta } from "@/components/Dashboard/categoryStyle";

const GROUPED_CATEGORIES = ["mobile_topup", "internet", "mobile_pack"];

function hrefForCategory(category: string): string {
  if (category === "internet") return "/internet";
  if (category === "mobile_pack") return "/mobile-pack";
  if (category === "mobile_topup") return "/topup";
  return "/services";
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function deriveFirstName(user: { full_name?: string; email?: string } | null): string {
  if (!user) return "";
  const source = user.full_name || user.email || "";
  const first = source.split(" ")[0];
  return first.includes("@") ? first.split("@")[0] : first;
}

export default function DashboardPage() {
  const { data: products, isLoading, isError } = useServices();
  const { data: transactions } = useTransactions();
  const { user } = useAuth();
  const firstName = deriveFirstName(user);
  const greeting = getGreeting();

  const tiles: Tile[] = useMemo(() => {
    const active = (products || []).filter((p: Product) => p.is_active);
    const out: Tile[] = [];
    const groupedSeen = new Set<string>();

    for (const p of active) {
      if (GROUPED_CATEGORIES.includes(p.category)) {
        if (groupedSeen.has(p.category)) continue;
        groupedSeen.add(p.category);
        const items = active.filter((x) => x.category === p.category);
        out.push({
          key: `group-${p.category}`,
          name: categoryMeta(p.category).label,
          category: p.category,
          href: hrefForCategory(p.category),
          options: items.map((x) => x.name).slice(0, 3),
        });
      } else {
        out.push({
          key: p.id,
          name: p.name,
          category: p.category,
          href: `/services/${p.id}`,
        });
      }
    }
    return out;
  }, [products]);

  const stats = useMemo(() => {
    const tx = transactions ?? [];
    const paid = tx.filter((t) => t.status === "success");
    const pending = tx.filter((t) => t.status === "pending" || t.status === "processing");
    const totalPaid = paid.reduce((s, t) => s + (t.amount_npr || 0), 0);
    const now = new Date();
    const mPaid = paid.filter((t) => {
      const d = new Date(t.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthTotal = mPaid.reduce((s, t) => s + (t.amount_npr || 0), 0);
    return {
      totalPaid,
      monthTotal,
      paidCount: paid.length,
      pendingCount: pending.length,
    };
  }, [transactions]);

  return (
    <div className="space-y-8">
      {/* Hero + stats banner */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-white p-5 shadow-sm shadow-moss/5 sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-moss/[0.08] blur-2xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-saffron/[0.10] blur-2xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-moss">
              <Sparkles className="h-4 w-4" />
              {greeting}, {firstName || "there"}
            </p>
            <h1 className="mt-1.5 font-display text-xl font-bold leading-tight text-ink sm:text-2xl">
              What would you like to pay?
            </h1>
            <p className="mt-2 max-w-md text-sm text-ink-3">
              Pick a service, enter the details, and pay securely with your card — in any currency.
            </p>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-5 sm:grid-cols-4">
          <div>
            <p className="text-2xl font-bold tracking-tight text-ink">{formatMoney(stats.totalPaid, "NPR")}</p>
            <p className="mt-0.5 text-[12px] font-medium text-ink-3">Total paid · all time</p>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-ink">{formatMoney(stats.monthTotal, "NPR")}</p>
            <p className="mt-0.5 text-[12px] font-medium text-ink-3">This month</p>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-ink">{stats.paidCount}</p>
            <p className="mt-0.5 text-[12px] font-medium text-ink-3">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-ink">{stats.pendingCount}</p>
            <p className="mt-0.5 text-[12px] font-medium text-ink-3">In progress</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Services</h2>
            <p className="text-[13px] text-ink-3">Tap a service to get started</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-line" />
            ))}
          </div>
        ) : isError ? (
          <p className="rounded-2xl border border-line bg-white p-6 text-sm text-danger">
            Couldn&apos;t load products. Check your connection and try again.
          </p>
        ) : tiles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line-2 bg-white/50 p-6 text-sm text-ink-3">
            No products are available right now.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {tiles.map((t) => (
              <ServiceTile key={t.key} tile={t} />
            ))}
          </div>
        )}
      </section>

      {/* Recent activity */}
      <RecentActivity transactions={transactions} />
    </div>
  );
}
