"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useServices } from "@/hooks/useServices";
import { useConfig } from "@/hooks/useConfig";
import { rateForCurrency } from "@/lib/exchangeRate";
import { useCreateTransaction, useInitiatePayment } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { LiveRateBadge } from "@/components/LiveRateBadge";
import { computeFeesInCurrency } from "@/lib/fees";

export default function MobilePackPage() {
  const router = useRouter();
  const { data: products } = useServices();
  const { data: config } = useConfig();
  const createTransaction = useCreateTransaction();
  const initiatePayment = useInitiatePayment();

  const [step, setStep] = useState<"form" | "review">("form");
  const [provider, setProvider] = useState<Product | null>(null);
  const [account, setAccount] = useState("");
  const [amountNpr, setAmountNpr] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState("");

  const packProducts = (products || []).filter((p) => p.category === "mobile_pack" && p.is_active);

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

    if (!provider) {
      setError("Choose your provider.");
      return;
    }
    if (!account || !amountNpr || Number(amountNpr) <= 0) {
      setError("Fill in all fields with a valid amount.");
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
        recipient_number: account,
        amount_npr: Number(amountNpr),
        currency,
      });
      const redirectUrl = await initiatePayment.mutateAsync(tx.id);
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err?.response?.data?.error || "Couldn't start the payment. Try again.");
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <h1 className="font-display text-2xl text-ink">Mobile Pack</h1>
      <p className="mt-1 text-sm text-ink-3">Pick your provider, enter the number, and pay for a data/SMS pack.</p>

      {step === "form" ? (
        <Card className="mt-6">
          <form onSubmit={handleContinue} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-2/80">Provider</label>
              <select
                value={provider?.id || ""}
                onChange={(e) => {
                  const found = packProducts.find((p) => p.id === e.target.value) || null;
                  setProvider(found);
                }}
                className="rounded-lg border border-line-2 bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-moss focus:outline-none focus:ring-1 focus:ring-moss"
                required
              >
                <option value="">Select provider…</option>
                {packProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <Input
              label="Phone number"
              placeholder="98XXXXXXX or 97XXXXXXX"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              required
            />

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
          <h2 className="text-lg font-semibold text-ink">Review your payment</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-3">Provider</dt>
              <dd className="font-medium text-ink">{provider?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-3">Phone number</dt>
              <dd className="font-medium text-ink">{account}</dd>
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
  );
}

interface Product {
  id: string;
  name: string;
  category: string;
  product_code: string;
  min_amount: number;
  max_amount: number;
  service_charge: number;
  bank_processing_fee: number;
  is_active: boolean;
}
