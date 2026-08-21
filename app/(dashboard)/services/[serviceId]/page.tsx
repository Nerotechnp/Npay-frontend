"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useService } from "@/hooks/useServices";
import { useConfig } from "@/hooks/useConfig";
import { rateForCurrency } from "@/lib/exchangeRate";
import { useCreateTransaction, useInitiatePayment } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { LiveRateBadge } from "@/components/LiveRateBadge";
import { computeFeesInCurrency } from "@/lib/fees";

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

  const rate = rateForCurrency(config, currency);
  const currencies = config?.supported_currencies || ["USD"];
  const { service, bank, total } = computeFeesInCurrency(Number(amountNpr), rate, product);
  const amountCharged = total.toFixed(2);
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

      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{product.name}</h1>
        <p className="mt-2 text-sm text-ink-3">
          Enter the details below. We&apos;ll show you the exact amount before you pay.
        </p>
      </div>

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
                  <dt>Service charge ({product?.service_charge ?? 0}%)</dt>
                  <dd>{service.toFixed(2)} {currency}</dd>
                </div>
                <div className="flex justify-between text-xs text-ink-3/70">
                  <dt>Bank processing fee ({product?.bank_processing_fee ?? 0}%)</dt>
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
