"use client";

import { useState } from "react";
import {
  useAdminTransactions,
  useUpdateAdminTransactionStatus,
} from "@/hooks/admin/useAdminTransactions";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { formatDate, formatMoney, statusLabel, statusTone } from "@/lib/format";
import type { TransactionStatus } from "@/types";

const STATUS_OPTIONS: TransactionStatus[] = ["pending", "processing", "success", "failed", "refunded"];

// gatewayName derives a human-readable delivery gateway name from the
// transaction's provider_reference (e.g. "khalti:242016" -> "Khalti").
function gatewayName(providerRef: string): string {
  if (!providerRef) return "—";
  const code = providerRef.split(":")[0].toLowerCase();
  switch (code) {
    case "khalti":
      return "Khalti";
    case "esewa":
      return "eSewa";
    case "ime":
      return "IME";
    default:
      return code || "—";
  }
}

export default function AdminTransactionsPage() {
  const [status, setStatus] = useState<TransactionStatus | "">("");
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = useAdminTransactions(status, offset);
  const updateStatus = useUpdateAdminTransactionStatus();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Transactions</h1>
      <p className="mt-1 text-sm text-ink-3">
        Every payment across all users. Override a status manually if the automated flow needs a nudge.
      </p>

      <div className="mt-6 max-w-xs">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as TransactionStatus | "");
            setOffset(0);
          }}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </Select>
      </div>

      <Card className="mt-4 overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs text-ink-3">
            <tr>
              <th className="bg-paper px-5 py-3 font-medium">Recipient</th>
              <th className="bg-paper px-5 py-3 font-medium">Amount</th>
              <th className="bg-paper px-5 py-3 font-medium">Gateway</th>
              <th className="bg-paper px-5 py-3 font-medium">Gateway Ref</th>
              <th className="bg-paper px-5 py-3 font-medium">Gateway Response</th>
              <th className="bg-paper px-5 py-3 font-medium">Date</th>
              <th className="bg-paper px-5 py-3 font-medium">Status</th>
              <th className="bg-paper px-5 py-3 font-medium text-right">Override</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-ink-3">
                  Loading…
                </td>
              </tr>
            )}
            {data?.transactions.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-ink-3">
                  No transactions match this filter.
                </td>
              </tr>
            )}
            {data?.transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3 font-medium text-ink">{tx.recipient_number}</td>
                <td className="px-5 py-3 text-ink-2/70">{formatMoney(tx.amount_charged, tx.currency)}</td>
                <td className="px-5 py-3 text-ink-3">{gatewayName(tx.provider_reference)}</td>
                <td className="px-5 py-3 font-mono text-xs text-ink-3">
                  {tx.provider_reference || tx.gateway_reference || "—"}
                </td>
                <td className="px-5 py-3 max-w-[16rem] text-xs text-ink-3">
                  {tx.receipt_message || "—"}
                </td>
                <td className="px-5 py-3 text-ink-3">{formatDate(tx.created_at)}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${statusTone(tx.status)}`}>
                    {statusLabel(tx.status)}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <select
                    className="rounded-lg border border-line-2 bg-paper px-2 py-1 text-xs text-ink focus:border-moss focus:outline-none focus:ring-1 focus:ring-moss"
                    value={tx.status}
                    disabled={updateStatus.isPending}
                    onChange={(e) => {
                      const next = e.target.value as TransactionStatus;
                      if (next !== tx.status && confirm(`Change status to "${statusLabel(next)}"?`)) {
                        updateStatus.mutate({ id: tx.id, status: next });
                      }
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {data && data.total > 20 && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink/50">
          <span>
            {offset + 1}–{Math.min(offset + 20, data.total)} of {data.total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - 20))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              disabled={offset + 20 >= data.total}
              onClick={() => setOffset(offset + 20)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
