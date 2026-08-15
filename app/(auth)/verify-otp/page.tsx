"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      router.push("/dashboard");
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
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl text-ink">Check your email</h1>
          <p className="mt-2 text-sm text-ink-3">
            We sent a 6-digit code to <span className="font-medium text-ink">{email}</span>
          </p>
        </div>

        <Card className="flex flex-col items-center gap-5">
          <OTPInput value={code} onChange={setCode} />
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button
            className="w-full"
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
            className="text-xs text-ink/50 hover:text-ink disabled:opacity-50"
          >
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
          </button>
        </Card>
      </div>
    </main>
  );
}
