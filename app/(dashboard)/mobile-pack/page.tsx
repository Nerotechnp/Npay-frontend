"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useServices, useDetectProduct } from "@/hooks/useServices";
import { useConfig } from "@/hooks/useConfig";
import { rateForCurrency } from "@/lib/exchangeRate";
import { useCreateTransaction, useInitiatePayment } from "@/hooks/useTransactions";
import { usePacks } from "@/hooks/usePacks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { LiveRateBadge } from "@/components/LiveRateBadge";
import { computeFeesInCurrency } from "@/lib/fees";
import type { MobilePack, Product } from "@/types";

export default function MobilePackPage() {
  const { data: products } = useServices();
  const { data: config } = useConfig();
  const detectProduct = useDetectProduct();
  const createTransaction = useCreateTransaction();
  const initiatePayment = useInitiatePayment();

  const [step, setStep] = useState<"form" | "review">("form");
  const [provider, setProvider] = useState<Product | null>(null);
  const [pack, setPack] = useState<MobilePack | null>(null);
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState("");
  const [packModalOpen, setPackModalOpen] = useState(false);
  const [phoneValid, setPhoneValid] = useState(false);

  const packProducts = (products || []).filter(
    (p) => p.category === "mobile_pack" && p.is_active
  );

  const activeProvider = provider ?? packProducts[0] ?? null;
  useEffect(() => {
    if (!provider && packProducts.length > 0) setProvider(packProducts[0]);
  }, [provider, packProducts]);

  // Server-side phone validation: debounced detect call confirms the number
  // belongs to the selected provider using admin-managed prefixes.
  useEffect(() => {
    setPhoneValid(false);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 3) return;
    const timer = setTimeout(() => {
      detectProduct.mutate(digits, {
        onSuccess: (detected) => {
          setPhoneValid(detected.id === activeProvider?.id);
        },
        onError: () => setPhoneValid(false),
      });
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, activeProvider?.id]);

  const { data: packs, isLoading: packsLoading } = usePacks(activeProvider?.id ?? null);

  const rate = rateForCurrency(config, currency);
  const currencies = config?.supported_currencies || ["USD"];
  const amountNpr = pack?.price ?? 0;
  const { service, bank, total } = computeFeesInCurrency(amountNpr, rate, activeProvider);
  const amountCharged = total.toFixed(2);
  const loading = createTransaction.isPending || initiatePayment.isPending;

  function selectProduct(p: Product) {
    setProvider(p);
    setPack(null);
    setPhone("");
    setPhoneValid(false);
    setError("");
  }

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!activeProvider) {
      setError("Choose your provider.");
      return;
    }
    if (!pack) {
      setError("Choose a pack.");
      return;
    }
    if (!phoneValid) {
      setError(`Enter a valid ${activeProvider.name} number (10 digits).`);
      return;
    }
    setStep("review");
  }

  async function handlePay() {
    if (!activeProvider || !pack) return;
    setError("");
    try {
      const tx = await createTransaction.mutateAsync({
        service_id: activeProvider.id,
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
        packProducts.length === 0 ? (
          <p className="text-sm text-ink-3">No mobile packs available right now.</p>
        ) : (
          <>
            {/* Provider switcher */}
            <div className="mb-4 flex gap-2">
              {packProducts.map((p) => {
                const active = activeProvider?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectProduct(p)}
                    className={`flex-1 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                      active
                        ? "border-moss bg-moss/10 text-ink ring-1 ring-moss"
                        : "border-line-2 bg-paper text-ink-3 hover:border-moss"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>

            <Card className="mt-2">
              <p className="mb-3 text-sm font-medium text-ink-2/80">Available pack</p>
              <button
                type="button"
                onClick={() => setPackModalOpen(true)}
                className="w-full rounded-xl border border-line-2 bg-paper px-4 py-3 text-left transition hover:border-moss"
              >
                {pack ? (
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-ink">{pack.label}</p>
                      <p className="text-xs text-ink-3">{pack.validity}</p>
                    </div>
                    <p className="text-sm font-semibold text-ink">{pack.price} NPR</p>
                  </div>
                ) : (
                  <span className="text-sm text-ink-3">Tap to choose a pack</span>
                )}
              </button>

              <form onSubmit={handleContinue} className="mt-5 flex flex-col gap-4">
                <div>
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
                  {phone.replace(/\D/g, "").length >= 3 && (
                    <p className={`mt-1 text-xs ${phoneValid ? "text-moss" : "text-ink-3"}`}>
                      {phoneValid
                        ? `Valid ${activeProvider?.name} number`
                        : "Number does not match selected provider"}
                    </p>
                  )}
                </div>

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

                <Button type="submit" className="w-full" disabled={!pack || !phoneValid}>
                  Continue
                </Button>
              </form>
            </Card>

            {packModalOpen && (
              <Modal title="Choose a pack" onClose={() => setPackModalOpen(false)}>
                {packsLoading ? (
                  <p className="text-sm text-ink-3">Loading packs…</p>
                ) : (packs || []).length === 0 ? (
                  <p className="text-sm text-ink-3">No packs available for this provider right now.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {(packs || []).map((p) => {
                      const active = pack?.id === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setPack(p);
                            setError("");
                            setPackModalOpen(false);
                          }}
                          className={`rounded-xl border px-4 py-3 text-left transition ${
                            active
                              ? "border-moss bg-moss/10 ring-1 ring-moss"
                              : "border-line-2 bg-paper hover:border-moss"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-ink">{p.label}</p>
                              <p className="text-xs text-ink-3">{p.validity}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-ink">{p.price} NPR</p>
                              {active && <Check className="h-4 w-4 text-moss" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Modal>
            )}
          </>
        )
      ) : (
        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-ink">Review your pack</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-3">Provider</dt>
              <dd className="font-medium text-ink">{activeProvider?.name}</dd>
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
                  <dt>Service charge ({activeProvider?.service_charge ?? 0}%)</dt>
                  <dd>{service.toFixed(2)} {currency}</dd>
                </div>
                <div className="flex justify-between text-xs text-ink-3/70">
                  <dt>Bank processing fee ({activeProvider?.bank_processing_fee ?? 0}%)</dt>
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
