import type { AppConfig } from "@/types";
import { round2 } from "@/lib/fees";

// computeAmountCharged previews the foreign-currency amount the user will be
// charged, using the backend's authoritative live rate for the selected
// currency. This mirrors the backend's charge math so the preview matches the
// real transaction — but the backend remains the single source of truth and
// recomputes it on creation.
export function computeAmountCharged(amountNpr: string | number, rate: number): string {
  const npr = typeof amountNpr === "string" ? Number(amountNpr) : amountNpr;
  if (!rate || !npr || npr <= 0) return "0.00";
  return round2(npr / rate).toFixed(2);
}

// rateForCurrency returns the live NPR-per-unit rate for a currency from the
// backend's NRB feed. There is no static fallback — when the feed is
// unavailable it returns 0, which the UI renders as "—" / "0.00". Used for both
// the displayed rate and the charged amount preview so they stay consistent
// with what the backend actually charges.
export function rateForCurrency(config: AppConfig | undefined, currency: string): number {
  return config?.exchange_rates?.[currency]?.sell_per_unit ?? 0;
}
