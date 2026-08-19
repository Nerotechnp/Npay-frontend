import type { Product } from "@/types";

// round2 rounds a number to 2 decimal places (half-up), matching the backend's
// charge math so the frontend preview reconciles with the actual transaction.
export function round2(v: number): number {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

export interface FeeBreakdown {
  // service and bank are the NPR fee amounts derived from the product's
  // percentage fees. total is the amount the user actually pays
  // (principal + service + bank).
  service: number;
  bank: number;
  total: number;
}

// computeFees derives the Service Charge and Bank Processing Fee (percentages
// of the NPR principal defined on the product) and the total the user pays.
// The principal (delivered amount) is left untouched; the fees are added on top.
// Mirrors the backend's transaction charge math. All values are in NPR.
export function computeFees(
  amountNpr: number,
  product?: Pick<Product, "service_charge" | "bank_processing_fee"> | null
): FeeBreakdown {
  const principal = Number(amountNpr) || 0;
  const service = round2((principal * (product?.service_charge ?? 0)) / 100);
  const bank = round2((principal * (product?.bank_processing_fee ?? 0)) / 100);
  return { service, bank, total: round2(principal + service + bank) };
}

export interface FeeBreakdownPay {
  // service, bank and total are the fee amounts and the total the user pays,
  // all expressed in the payment currency (NPR amounts converted by `rate`).
  // total matches the amount the backend will actually charge.
  service: number;
  bank: number;
  total: number;
}

// computeFeesInCurrency mirrors the backend's charge math but expresses the
// Service Charge and Bank Processing Fee in the currency the user pays in
// (NPR fee amounts divided by the live rate), so the preview matches the real
// transaction. `rate` is NPR per 1 unit of the selected currency.
export function computeFeesInCurrency(
  amountNpr: number,
  rate: number,
  product?: Pick<Product, "service_charge" | "bank_processing_fee"> | null
): FeeBreakdownPay {
  const principal = Number(amountNpr) || 0;
  const serviceNpr = round2((principal * (product?.service_charge ?? 0)) / 100);
  const bankNpr = round2((principal * (product?.bank_processing_fee ?? 0)) / 100);
  const totalNpr = principal + serviceNpr + bankNpr;
  if (!rate || rate <= 0) {
    return { service: 0, bank: 0, total: 0 };
  }
  return {
    service: round2(serviceNpr / rate),
    bank: round2(bankNpr / rate),
    total: round2(totalNpr / rate),
  };
}
