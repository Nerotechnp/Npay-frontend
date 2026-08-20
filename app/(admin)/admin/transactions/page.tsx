"use client";

import { useState } from "react";
import {
  useAdminTransactions,
  useUpdateAdminTransactionStatus,
  useRetryAdminDelivery,
} from "@/hooks/admin/useAdminTransactions";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { formatDate, formatMoney, statusLabel, statusTone, deliveryStatusLabel, deliveryStatusTone } from "@/lib/format";
import type { Transaction, TransactionStatus } from "@/types";

const STATUS_OPTIONS: TransactionStatus[] = ["pending", "processing", "success", "failed", "refunded"];

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
  const retryDelivery = useRetryAdminDelivery();

  const rows = data?.transactions ?? [];

  const columns: Column<Transaction>[] = [
    {
      key: "id",
      header: "TXN ID",
      mobile: "field",
      headerClassName: "w-[9%]",
      render: (tx) => <span className="block truncate font-mono text-xs text-ink-3">{tx.id}</span>,
    },
    {
      key: "recipient",
      header: "Recipient",
      mobile: "primary",
      headerClassName: "w-[15%]",
      render: (tx) => (
        <div className="w-full min-w-0">
          <p className="truncate font-medium text-ink">{tx.recipient_number}</p>
          <p className="truncate text-xs text-ink-3">{formatDate(tx.created_at)}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      mobile: "field",
      headerClassName: "w-[9%]",
      render: (tx) => <span className="whitespace-nowrap text-ink-2/70">{formatMoney(tx.amount_charged, tx.currency)}</span>,
    },
    {
      key: "payment",
      header: "Payment Gateway",
      mobile: "field",
      headerClassName: "w-[13%]",
      render: (tx) =>
        tx.gateway_reference ? (
          <div className="w-full min-w-0">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
              CyberSource
            </span>
            <p className="mt-1 block truncate font-mono text-xs text-ink-3">{tx.gateway_reference}</p>
          </div>
        ) : (
          <span className="text-ink-3">—</span>
        ),
    },
    {
      key: "status",
      header: "Payment",
      headerClassName: "w-[9%]",
      render: (tx) => (
        <span
          className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium ${statusTone(tx.status)}`}
        >
          {statusLabel(tx.status)}
        </span>
      ),
    },
    {
      key: "provider",
      header: "Delivery Provider",
      mobile: "field",
      headerClassName: "w-[13%]",
      render: (tx) =>
        tx.provider_reference ? (
          <div className="w-full min-w-0">
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              {gatewayName(tx.provider_reference)}
            </span>
            <p className="mt-1 block truncate font-mono text-xs text-ink-3">{tx.provider_reference}</p>
          </div>
        ) : (
          <span className="text-ink-3">—</span>
        ),
    },
    {
      key: "delivery",
      header: "Delivery",
      mobile: "field",
      span: true,
      headerClassName: "w-[16%]",
      render: (tx) => (
        <div className="w-full min-w-0">
          <span
            className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium ${deliveryStatusTone(tx.delivery_status)}`}
          >
            {deliveryStatusLabel(tx.delivery_status)}
          </span>
          {tx.receipt_message && (
            <p className="mt-1 block truncate text-xs text-ink-3">{tx.receipt_message}</p>
          )}
        </div>
      ),
    },
    {
      key: "override",
      header: "Override",
      align: "right",
      headerClassName: "w-[15%]",
      render: (tx) => (
        <div className="flex flex-col items-end gap-1.5">
          {tx.status === "success" && tx.delivery_status === "failed" && (
            <button
              type="button"
              className="rounded-lg bg-moss px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-moss/90 disabled:opacity-50"
              disabled={retryDelivery.isPending}
              onClick={() => {
                if (confirm("Retry delivery to the provider?")) {
                  retryDelivery.mutate(tx.id);
                }
              }}
            >
              {retryDelivery.isPending ? "Retrying…" : "Retry delivery"}
            </button>
          )}
          <select
            className="w-full rounded-lg border border-line-2 bg-paper px-2 py-1.5 text-xs text-ink focus:border-moss focus:outline-none focus:ring-1 focus:ring-moss sm:w-auto"
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
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Transactions"
        subtitle="Every payment across all users. Override a status manually if the automated flow needs a nudge."
        actions={
          <div className="w-full sm:w-56">
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
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        rowKey={(tx) => tx.id}
        isLoading={isLoading}
        emptyMessage="No transactions match this filter."
      />

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
