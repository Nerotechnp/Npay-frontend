"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoveLeft, ShieldCheck, Globe, Zap } from "lucide-react";
import apiClient from "@/lib/api-client";
import { setTokens } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
import { OTPInput } from "@/components/OTPInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function VerifyOTPPage() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const pending = sessionStorage.getItem("pending_email");
    if (!pending) {
      router.replace("/login");
      return;
    }
    setEmail(pending);
  }, [router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  async function handleVerify() {
    setError("");
    setLoading(true);
    try {
      const res = await apiClient.post("/api/v1/auth/otp/verify", { email, code });
      const { access_token, refresh_token, user } = res.data.data;
      setTokens(access_token, refresh_token);
      setUser(user);
      sessionStorage.removeItem("pending_email");
      // Hard navigation: setting the token cookie via document.cookie right
      // before a client-side router.push isn't reliably included in that
      // first request, so the edge middleware bounces /dashboard -> /login
      // and you land on the dashboard only after a second hop. A full reload
      // guarantees the browser sends the cookie, so middleware lets us through.
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.response?.data?.error || "That code didn't work. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError("");
    try {
      await apiClient.post("/api/v1/auth/otp/request", { email });
      setResendCooldown(30);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Couldn't resend the code.");
    }
  }

  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-paper px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-moss/[0.08] blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-saffron/[0.10] blur-[100px]"
      />

      <Link
        href="/login"
        aria-label="Back to login"
        className="absolute left-4 top-4 z-10 flex h-11 items-center gap-2 rounded-full px-4 text-ink-3 transition-colors hover:bg-paper hover:text-ink sm:left-6 sm:top-6"
      >
        <MoveLeft className="h-5 w-5" strokeWidth={2.5} />
        <span className="text-sm font-medium">Back</span>
      </Link>

      <div className="relative w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-moss to-moss2 text-xl font-extrabold tracking-tight text-white shadow-lg shadow-moss/25">
            N
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Check your email</h1>
          <p className="mt-2 text-sm text-ink-3">
            We sent a 6-digit code to <span className="font-medium text-ink">{email}</span>
          </p>
        </div>

        <Card className="flex flex-col items-center gap-5 p-6 shadow-md shadow-moss/5 sm:p-7">
          <OTPInput value={code} onChange={setCode} />
          {error && (
            <div className="w-full rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-center text-xs text-danger">
              {error}
            </div>
          )}
          <Button
            className="w-full py-3 text-base"
            loading={loading}
            disabled={code.length !== 6}
            onClick={handleVerify}
          >
            Verify and continue
          </Button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-xs text-ink/50 transition-colors hover:text-ink disabled:opacity-50"
          >
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
          </button>
        </Card>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            { icon: ShieldCheck, label: "Secure" },
            { icon: Globe, label: "Any currency" },
            { icon: Zap, label: "Instant" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-white px-2 py-3 text-center"
            >
              <feature.icon className="h-4 w-4 text-moss" />
              <span className="text-xs font-medium text-ink-3">{feature.label}</span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-ink-3">
          Didn&apos;t get the code? Check your spam folder or resend below.
        </p>
      </div>
    </main>
  );
}
