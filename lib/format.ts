import type { Transaction } from "@/types";

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusLabel(status: Transaction["status"]): string {
  switch (status) {
    case "pending":
      return "Awaiting payment";
    case "processing":
      return "Processing";
    case "success":
      return "Delivered";
    case "failed":
      return "Failed";
    case "refunded":
      return "Refunded";
    default:
      return status;
  }
}

export function statusTone(status: Transaction["status"]): string {
  switch (status) {
    case "success":
      return "bg-green-50 text-green-700 border border-green-100";
    case "failed":
      return "bg-red-50 text-red-700 border border-red-100";
    case "processing":
    case "pending":
      return "bg-amber-50 text-amber-700 border border-amber-100";
    default:
      return "bg-ink/5 text-ink/60";
  }
}
