"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useServices } from "@/hooks/useServices";
import { useConfig } from "@/hooks/useConfig";
import { rateForCurrency } from "@/lib/exchangeRate";
import { useCreateTransaction, useInitiatePayment } from "@/hooks/useTransactions";
import type { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { LiveRateBadge } from "@/components/LiveRateBadge";
import { computeFeesInCurrency } from "@/lib/fees";

export default function TopupPage() {
  const { data: products } = useServices();
  const { data: config } = useConfig();
  const createTransaction = useCreateTransaction();
  const initiatePayment = useInitiatePayment();

  const [step, setStep] = useState<"form" | "review">("form");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState<Product | null>(null);
  const [amountNpr, setAmountNpr] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState("");

  // Instant, network-free carrier detection: the products (with their
  // admin-managed phone_prefixes) are already loaded by useServices(), so we just
  // match the 3-digit prefix client-side. No API round-trip, so it never feels slow.
  useEffect(() => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 3) {
      setProvider(null);
      return;
    }
    const prefix = digits.slice(0, 3);
    const match = (products || []).find(
      (p) =>
        p.is_active &&
        p.category === "mobile_topup" &&
        p.phone_prefixes
          .split(",")
          .map((x) => x.trim())
          .includes(prefix)
    );
    setProvider(match || null);
  }, [phone, products]);

  const rate = rateForCurrency(config, currency);
  const currencies = config?.supported_currencies || ["USD"];
  const { service, bank, total } = computeFeesInCurrency(Number(amountNpr), rate, provider);
  const amountCharged = total.toFixed(2);
  const minAmount = provider?.min_amount || 0;
  const maxAmount = provider?.max_amount || 0;
  const loading = createTransaction.isPending || initiatePayment.isPending;

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Enter a valid 10-digit Nepal mobile number.");
      return;
    }
    if (!provider) {
      setError("Enter a valid NTC or Ncell number.");
      return;
    }
    if (!amountNpr || Number(amountNpr) <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (minAmount > 0 && Number(amountNpr) < minAmount) {
      setError(`Amount must be at least ${minAmount} NPR.`);
      return;
    }
    if (maxAmount > 0 && Number(amountNpr) > maxAmount) {
      setError(`Amount must not exceed ${maxAmount} NPR.`);
      return;
    }
    setStep("review");
  }

  async function handlePay() {
    if (!provider) return;
    setError("");
    try {
      const tx = await createTransaction.mutateAsync({
        service_id: provider.id,
        recipient_number: phone,
        amount_npr: Number(amountNpr),
        currency,
      });
      const redirectUrl = await initiatePayment.mutateAsync(tx.id);

      // The backend returns the real gateway (CyberSource) hosted-checkout URL.
      // Send the user there to complete payment; the gateway returns them to the
      // receipt page via the ReturnURL once payment is confirmed.
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err?.response?.data?.error || "Couldn't start the payment. Try again.");
    }
  }

  return (
    <div className="relative">
      <div className="mx-auto w-full max-w-md">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Mobile Topup</h1>
        <p className="mt-2 text-sm text-ink-3">
          Enter the phone number — we&apos;ll detect the carrier (NTC or Ncell) automatically.
        </p>
      </div>

      {step === "form" ? (
        <Card className="mt-6">
          <form onSubmit={handleContinue} className="flex flex-col gap-4">
            <Input
              label="Phone number"
              placeholder="98XXXXXXX (10 digits)"
              inputMode="numeric"
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              required
            />

            {phone.replace(/\D/g, "").length >= 3 && (
              <p className={`text-xs ${provider ? "text-moss" : "text-ink-3"}`}>
                {provider ? `Detected: ${provider.name}` : "Carrier not recognized yet — keep typing a valid NTC/Ncell number."}
              </p>
            )}

            <Input
              label="Amount (NPR)"
              type="number"
              min={minAmount > 0 ? minAmount : 1}
              max={maxAmount > 0 ? maxAmount : undefined}
              placeholder="1000"
              value={amountNpr}
              onChange={(e) => setAmountNpr(e.target.value)}
              required
              disabled={!provider}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-2/80">Pay with</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="rounded-lg border border-line-2 bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-moss focus:outline-none focus:ring-1 focus:ring-moss"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-xs text-danger">{error}</p>}

            <Button type="submit" className="w-full" disabled={!provider}>
              Continue
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-ink">Review your topup</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-3">Carrier</dt>
              <dd className="font-medium text-ink">{provider?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-3">Phone number</dt>
              <dd className="font-medium text-ink">{phone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-3">Amount</dt>
              <dd className="text-right font-medium text-ink">
                {Number(amountNpr).toLocaleString()} NPR
                <span className="block text-xs font-normal text-ink-3">
                  {rate > 0 ? (Number(amountNpr) / rate).toFixed(2) : "0.00"} {currency}
                </span>
              </dd>
            </div>
            {service > 0 || bank > 0 ? (
              <>
                <div className="flex justify-between text-xs text-ink-3/70">
                  <dt>Service charge ({provider?.service_charge ?? 0}%)</dt>
                  <dd>{service.toFixed(2)} {currency}</dd>
                </div>
                <div className="flex justify-between text-xs text-ink-3/70">
                  <dt>Bank processing fee ({provider?.bank_processing_fee ?? 0}%)</dt>
                  <dd>{bank.toFixed(2)} {currency}</dd>
                </div>
              </>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-ink-3">You&apos;ll be charged</dt>
              <dd className="font-medium text-ink">{currency} {amountCharged}</dd>
            </div>
            <div className="flex justify-between text-xs text-ink-3/70">
              <dt>Rate</dt>
              <dd className="flex items-center gap-2">
                1 {currency} ≈ {rate > 0 ? rate : "—"} NPR
                <LiveRateBadge config={config} />
              </dd>
            </div>
          </dl>

          {error && <p className="mt-3 text-xs text-danger">{error}</p>}

          <div className="mt-5 flex gap-2">
            <Button variant="secondary" className="w-1/3" onClick={() => setStep("form")} disabled={loading}>
              Back
            </Button>
            <Button className="w-2/3" onClick={handlePay} loading={loading}>
              Payment
            </Button>
          </div>
        </Card>
      )}
      </div>
    </div>
  );
}

