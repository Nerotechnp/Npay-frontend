"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useService } from "@/hooks/useServices";
import { useConfig } from "@/hooks/useConfig";
import { useCreateTransaction, useInitiatePayment } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function ServicePaymentPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const router = useRouter();
  const { data: product, isLoading } = useService(serviceId);
  const { data: config } = useConfig();

  const [step, setStep] = useState<"form" | "review">("form");
  const [recipient, setRecipient] = useState("");
  const [amountNpr, setAmountNpr] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState("");

  const createTransaction = useCreateTransaction();
  const initiatePayment = useInitiatePayment();

  const exchangeRate = config?.exchange_rate_usd_to_npr || 0;
  const currencies = config?.supported_currencies || ["USD"];
  const amountCharged =
    exchangeRate > 0 && amountNpr ? (Number(amountNpr) / exchangeRate).toFixed(2) : "0.00";
  const loading = createTransaction.isPending || initiatePayment.isPending;

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!recipient || !amountNpr || Number(amountNpr) <= 0) {
      setError("Fill in all fields with a valid amount.");
      return;
    }
    if (product && product.min_amount > 0 && Number(amountNpr) < product.min_amount) {
      setError(`Amount must be at least ${product.min_amount} NPR.`);
      return;
    }
    if (product && product.max_amount > 0 && Number(amountNpr) > product.max_amount) {
      setError(`Amount must not exceed ${product.max_amount} NPR.`);
      return;
    }
    setStep("review");
  }

  async function handlePay() {
    if (!product) return;
    setError("");
    try {
      const tx = await createTransaction.mutateAsync({
        service_id: product.id,
        recipient_number: recipient,
        amount_npr: Number(amountNpr),
        currency,
      });
      const redirectUrl = await initiatePayment.mutateAsync(tx.id);
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err?.response?.data?.error || "Couldn't start the payment. Try again.");
    }
  }

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-line" />;
  }

  if (!product) {
    return <p className="text-sm text-danger">Product not found.</p>;
  }

  return (
    <div className="mx-auto max-w-md">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <h1 className="font-display text-2xl text-ink">{product.name}</h1>
      <p className="mt-1 text-sm text-ink-3">
        Enter the details below. We&apos;ll show you the exact amount before you pay.
      </p>

      {step === "form" ? (
        <Card className="mt-6">
          <form onSubmit={handleContinue} className="flex flex-col gap-4">
            <Input
              label={product.category === "mobile_topup" ? "Phone number" : "Account / customer number"}
              placeholder="e.g. 98XXXXXXXX"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />

            <Input
              label="Amount (NPR)"
              type="number"
              min={product.min_amount > 0 ? product.min_amount : 1}
              max={product.max_amount > 0 ? product.max_amount : undefined}
              placeholder="1000"
              value={amountNpr}
              onChange={(e) => setAmountNpr(e.target.value)}
              required
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

            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-ink">Review your payment</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-3">{product.category === "telecom" ? "Phone number" : "Account"}</dt>
              <dd className="font-medium text-ink">{recipient}</dd>
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
