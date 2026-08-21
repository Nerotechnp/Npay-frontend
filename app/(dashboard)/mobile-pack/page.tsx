"use client";

import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useServices } from "@/hooks/useServices";
import { useConfig } from "@/hooks/useConfig";
import { rateForCurrency } from "@/lib/exchangeRate";
import { useCreateTransaction, useInitiatePayment } from "@/hooks/useTransactions";
import { usePacks } from "@/hooks/usePacks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { LiveRateBadge } from "@/components/LiveRateBadge";
import { computeFeesInCurrency } from "@/lib/fees";
import type { MobilePack, Product } from "@/types";

export default function MobilePackPage() {
  const { data: products } = useServices();
  const { data: config } = useConfig();
  const createTransaction = useCreateTransaction();
  const initiatePayment = useInitiatePayment();

  const [step, setStep] = useState<"form" | "review">("form");
  const [provider, setProvider] = useState<Product | null>(null);
  const [pack, setPack] = useState<MobilePack | null>(null);
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState("");

  const packProducts = (products || []).filter(
    (p) => p.category === "mobile_pack" && p.is_active
  );

  // Packs are loaded from the product's delivery gateway at runtime, so they
  // always reflect what the gateway can actually provision.
  const { data: packs, isLoading: packsLoading } = usePacks(provider?.id ?? null);

  const rate = rateForCurrency(config, currency);
  const currencies = config?.supported_currencies || ["USD"];
  const amountNpr = pack?.price ?? 0;
  const { service, bank, total } = computeFeesInCurrency(amountNpr, rate, provider);
  const amountCharged = total.toFixed(2);
  const loading = createTransaction.isPending || initiatePayment.isPending;

  // Validate the phone the same way mobile topup does: require a 10-digit Nepal
  // number, and — when the product declares phone_prefixes — that the number
  // matches one of them. An empty prefix list (no admin config) is allowed.
  function phoneMatchesProvider(value: string): boolean {
    if (!provider) return false;
    const normalized = value.replace(/\D/g, "");
    if (normalized.length !== 10) return false;
    const prefixes = (provider.phone_prefixes || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    if (prefixes.length === 0) return true;
    return prefixes.some((prefix) => normalized.startsWith(prefix));
  }

  function selectProduct(p: Product) {
    setProvider(p);
    setPack(null);
    setPhone("");
    setError("");
  }

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!provider) {
      setError("Choose your provider.");
      return;
    }
    if (!pack) {
      setError("Choose a pack.");
      return;
    }
    if (!phoneMatchesProvider(phone)) {
      setError(`Enter a valid ${provider.name} number (10 digits).`);
      return;
    }
    setStep("review");
  }

  async function handlePay() {
    if (!provider || !pack) return;
    setError("");
    try {
      const tx = await createTransaction.mutateAsync({
        service_id: provider.id,
        recipient_number: phone,
        amount_npr: amountNpr,
        currency,
        package_reference: pack.id,
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

      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Mobile Pack</h1>
        <p className="mt-2 text-sm text-ink-3">
          Pick your carrier, choose a pack, and pay for data/SMS.
        </p>
      </div>

      {step === "form" ? (
        !provider ? (
          <div className="grid grid-cols-2 gap-3">
            {packProducts.length === 0 ? (
              <p className="col-span-2 text-sm text-ink-3">No mobile packs available right now.</p>
            ) : (
              packProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectProduct(p)}
                  className="rounded-xl border border-line-2 bg-paper px-4 py-6 text-left transition hover:border-moss focus:border-moss focus:outline-none focus:ring-1 focus:ring-moss"
                >
                  <span className="block text-base font-semibold text-ink">{p.name}</span>
                  <span className="mt-1 block text-xs text-ink-3">View packs</span>
                </button>
              ))
            )}
          </div>
        ) : (
          <Card className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-3">Selected provider</p>
                <p className="text-base font-semibold text-ink">{provider.name}</p>
              </div>
              <button
                type="button"
                onClick={() => selectProduct(provider)}
                className="text-xs font-medium text-moss hover:underline"
              >
                Change
              </button>
            </div>

            <p className="mb-2 text-sm font-medium text-ink-2/80">Available packs</p>
            {packsLoading ? (
              <p className="text-sm text-ink-3">Loading packs…</p>
            ) : (packs || []).length === 0 ? (
              <p className="text-sm text-ink-3">No packs available for this provider right now.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {(packs || []).map((p) => {
                const active = pack?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPack(p);
                      setError("");
                    }}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      active
                        ? "border-moss bg-moss/10 ring-1 ring-moss"
                        : "border-line-2 bg-paper hover:border-moss"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-sm font-semibold text-ink">{p.label}</span>
                      {active && <Check className="h-4 w-4 shrink-0 text-moss" />}
                    </div>
                    <span className="mt-1 block text-xs text-ink-3">{p.validity}</span>
                    <span className="mt-1 block text-sm font-medium text-ink">{p.price} NPR</span>
                  </button>
                );
              })}
              </div>
            )}


            <form onSubmit={handleContinue} className="mt-5 flex flex-col gap-4">
              <Input
                label="Phone number"
                placeholder="98XXXXXXX or 97XXXXXXX"
                inputMode="numeric"
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                required
                disabled={!pack}
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

              <Button type="submit" className="w-full" disabled={!pack || !phone}>
                Continue
              </Button>
            </form>
          </Card>
        )
      ) : (
        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-ink">Review your pack</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-3">Provider</dt>
              <dd className="font-medium text-ink">{provider?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-3">Pack</dt>
              <dd className="text-right font-medium text-ink">
                {pack?.label}
                <span className="block text-xs font-normal text-ink-3">{pack?.validity}</span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-3">Phone number</dt>
              <dd className="font-medium text-ink">{phone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-3">Amount</dt>
              <dd className="text-right font-medium text-ink">
                {amountNpr.toLocaleString()} NPR
                <span className="block text-xs font-normal text-ink-3">
                  {rate > 0 ? (amountNpr / rate).toFixed(2) : "0.00"} {currency}
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
