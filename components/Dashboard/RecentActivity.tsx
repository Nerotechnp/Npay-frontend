"use client";

import Link from "next/link";
import { Receipt, ArrowRight } from "lucide-react";
import { formatMoney, statusTone, statusLabel } from "@/lib/format";
import type { Transaction } from "@/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function RecentActivity({ transactions }: { transactions?: Transaction[] }) {
  const items = (transactions ?? []).slice(0, 5);

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-moss/10 text-moss">
            <Receipt className="h-4 w-4" />
          </span>
          <h2 className="text-[15px] font-semibold text-ink">Recent activity</h2>
        </div>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-[13px] font-medium text-moss transition-colors hover:text-moss2"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-line-2 bg-paper/50 py-10 text-center text-[13px] text-ink-3">
          No transactions yet. Your payments will show up here.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {items.map((t) => (
            <li key={t.id}>
              <Link
                href={`/transactions/${t.id}`}
                className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-paper/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-ink">
                    {t.recipient_number || "Payment"}
                  </p>
                  <p className="mt-0.5 text-[12px] text-ink-3">{timeAgo(t.created_at)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-[14px] font-semibold text-ink">
                    {formatMoney(t.amount_npr, "NPR")}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusTone(t.status)}`}
                  >
                    {statusLabel(t.status)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
