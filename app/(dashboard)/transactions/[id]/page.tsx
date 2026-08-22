"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useTransaction } from "@/hooks/useTransactions";
import { Card } from "@/components/ui/Card";
import { formatDate, formatMoney, statusLabel } from "@/lib/format";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tx, isLoading } = useTransaction(id);

  if (isLoading || !tx) {
    return <div className="h-64 animate-pulse rounded-xl bg-line" />;
  }

  const isSettling = tx.status === "pending" || tx.status === "processing";

  return (
    <div className="mx-auto max-w-md">
      <Link
        href="/transactions"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to history
      </Link>

      <Card className="flex flex-col items-center gap-3 text-center">
        <StatusIcon status={tx.status} />
        <h1 className="font-display text-xl text-ink">{statusLabel(tx.status)}</h1>
        {isSettling && (
          <p className="text-xs text-ink-3">
            This updates automatically once your bank confirms the payment.
          </p>
        )}

        <div className="mt-4 w-full divide-y divide-line rounded-md border border-line text-left text-sm">
          <Row label="Recipient" value={tx.recipient_number} />
          <Row
            label="Amount (principal)"
            value={
              <span>
                {formatMoney(tx.amount_npr, "NPR")}
                <span className="block text-xs font-normal text-ink-3">
                  {tx.exchange_rate > 0
                    ? (tx.amount_npr / tx.exchange_rate).toFixed(2)
                    : "0.00"}{" "}
                  {tx.currency}
                </span>
              </span>
            }
          />
          {tx.service_charge > 0 && (
            <Row label="Service charge" value={formatMoney(tx.service_charge, tx.currency)} />
          )}
          {tx.bank_processing_fee > 0 && (
            <Row label="Bank processing fee" value={formatMoney(tx.bank_processing_fee, tx.currency)} />
          )}
          <Row label="Amount charged" value={formatMoney(tx.amount_charged, tx.currency)} />
          <Row label="Rate" value={`1 ${tx.currency} ≈ ${tx.exchange_rate} NPR`} />
          <Row label="Date" value={formatDate(tx.created_at)} />
          <Row label="Our reference" value={`npay-${tx.id}`} />
          {tx.provider_reference && (
            <Row label="Gateway reference" value={tx.provider_reference} />
          )}
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
    <div className="flex justify-between px-4 py-2.5">
      <span className="text-ink-3">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}
