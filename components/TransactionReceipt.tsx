import Link from "next/link";
import { formatDate, formatMoney, statusLabel, statusTone } from "@/lib/format";
import type { Transaction } from "@/types";

export function TransactionReceipt({ tx }: { tx: Transaction }) {
  return (
    <Link
      href={`/transactions/${tx.id}`}
      className="flex items-center justify-between rounded-xl border border-line bg-white px-5 py-4 shadow-sm transition-colors hover:border-moss"
    >
      <div>
        <p className="text-sm font-medium text-ink">{tx.recipient_number}</p>
        <p className="mt-0.5 text-xs text-ink-3">{formatDate(tx.created_at)}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-ink">
          {formatMoney(tx.amount_charged, tx.currency)}
        </p>
        <span className={`mt-1 inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${statusTone(tx.status)}`}>
          {statusLabel(tx.status)}
        </span>
      </div>
    </Link>
  );
}
