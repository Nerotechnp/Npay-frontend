"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useAdminTransaction } from "@/hooks/admin/useAdminTransactions";
import { Card } from "@/components/ui/Card";
import { formatDate, formatMoney, statusLabel, statusTone, deliveryStatusLabel, deliveryStatusTone } from "@/lib/format";

export default function AdminTransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tx, isLoading } = useAdminTransaction(id);

  if (isLoading || !tx) {
    return <div className="h-64 animate-pulse rounded-xl bg-line" />;
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/admin/transactions"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to transactions
      </Link>

      <Card className="flex flex-col items-center gap-3 text-center">
        <StatusIcon status={tx.status} />
        <h1 className="font-display text-xl text-ink">{statusLabel(tx.status)}</h1>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${statusTone(tx.status)}`}
          >
            Payment: {statusLabel(tx.status)}
          </span>
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${deliveryStatusTone(tx.delivery_status)}`}
          >
            Delivery: {deliveryStatusLabel(tx.delivery_status)}
          </span>
        </div>

        <div className="mt-4 w-full divide-y divide-line rounded-md border border-line text-left text-sm">
          <Row label="TXN ID" value={<span className="font-mono">{tx.id}</span>} />
          <Row label="Recipient" value={tx.recipient_number} />
          <Row
            label="Amount (NPR)"
            value={formatMoney(tx.amount_npr, "NPR")}
          />
          <Row
            label="Amount charged"
            value={formatMoney(tx.amount_charged, tx.currency)}
          />
          {tx.service_charge > 0 && (
            <Row label="Service charge" value={formatMoney(tx.service_charge, tx.currency)} />
          )}
          {tx.bank_processing_fee > 0 && (
            <Row label="Bank processing fee" value={formatMoney(tx.bank_processing_fee, tx.currency)} />
          )}
          <Row label="Rate" value={`1 ${tx.currency} ≈ ${tx.exchange_rate} NPR`} />
          <Row label="Date" value={formatDate(tx.created_at)} />
          <Row label="Gateway reference" value={tx.gateway_reference || "—"} />
          <Row label="Provider reference" value={tx.provider_reference || "—"} />
          <Row label="Response" value={tx.receipt_message || "—"} />
        </div>
      </Card>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "success") return <CheckCircle2 className="h-10 w-10 text-green-600" />;
  if (status === "failed") return <XCircle className="h-10 w-10 text-danger" />;
  return <Clock className="h-10 w-10 animate-pulse text-saffron" />;
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-2.5">
      <span className="text-ink-3">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}
