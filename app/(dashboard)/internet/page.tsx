"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useServices } from "@/hooks/useServices";
import { useConfig } from "@/hooks/useConfig";
import { useCreateTransaction, useInitiatePayment } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function InternetPage() {
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

  const internetProducts = (products || []).filter((p) => p.category === "internet" && p.is_active);

  const exchangeRate = config?.exchange_rate_usd_to_npr || 0;
  const currencies = config?.supported_currencies || ["USD"];
  const amountCharged =
    exchangeRate > 0 && amountNpr ? (Number(amountNpr) / exchangeRate).toFixed(2) : "0.00";
  const minAmount = provider?.min_amount || 0;
  const maxAmount = provider?.max_amount || 0;
  const loading = createTransaction.isPending || initiatePayment.isPending;

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!provider) {
      setError("Choose your internet provider.");
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

      <h1 className="font-display text-2xl text-ink">Internet</h1>
      <p className="mt-1 text-sm text-ink-3">Pick your ISP, enter your account number, and pay.</p>

      {step === "form" ? (
        <Card className="mt-6">
          <form onSubmit={handleContinue} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-2/80">Provider</label>
              <select
                value={provider?.id || ""}
                onChange={(e) => {
                  const found = internetProducts.find((p) => p.id === e.target.value) || null;
                  setProvider(found);
                }}
                className="rounded-lg border border-line-2 bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-moss focus:outline-none focus:ring-1 focus:ring-moss"
                required
              >
                <option value="">Select provider…</option>
                {internetProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <Input
              label="Account / customer number"
              placeholder="e.g. 01XXXXXXXX"
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
              <dt className="text-ink-3">Account</dt>
              <dd className="font-medium text-ink">{account}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-3">Amount</dt>
              <dd className="font-medium text-ink">{Number(amountNpr).toLocaleString()} NPR</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-3">You&apos;ll be charged</dt>
              <dd className="font-medium text-ink">{currency} {amountCharged}</dd>
            </div>
            <div className="flex justify-between text-xs text-ink-3/70">
              <dt>Rate</dt>
              <dd>1 {currency} ≈ {exchangeRate > 0 ? exchangeRate : "—"} NPR (est.)</dd>
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
  is_active: boolean;
}
