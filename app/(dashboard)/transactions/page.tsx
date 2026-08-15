"use client";

import { useTransactions } from "@/hooks/useTransactions";
import { TransactionReceipt } from "@/components/TransactionReceipt";

export default function TransactionsPage() {
  const { data: transactions, isLoading, isError } = useTransactions();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Payment history</h1>
      <p className="mt-1 text-sm text-ink-3">Every payment you've made, in one place.</p>

      {isLoading && (
        <div className="mt-8 flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-line" />
          ))}
        </div>
      )}

      {isError && (
        <p className="mt-8 text-sm text-danger">Couldn&apos;t load your history. Try again.</p>
      )}

      {transactions && transactions.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-line py-16 text-center">
          <p className="text-sm text-ink-3">No payments yet.</p>
          <p className="mt-1 text-xs text-ink-3/70">Once you pay a bill, it'll show up here.</p>
        </div>
      )}

      {transactions && transactions.length > 0 && (
        <div className="mt-8 flex flex-col gap-3">
          {transactions.map((tx) => (
            <TransactionReceipt key={tx.id} tx={tx} />
          ))}
        </div>
      )}
    </div>
  );
}
