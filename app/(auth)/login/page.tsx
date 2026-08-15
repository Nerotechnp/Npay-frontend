"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import { getAccessToken } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (getAccessToken()) router.replace("/dashboard");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/otp/request", { email });
      sessionStorage.setItem("pending_email", email);
      router.push("/verify-otp");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-moss text-lg font-extrabold tracking-tight text-white">
            N
          </div>
          <h1 className="font-display text-3xl text-ink">Welcome to Npay</h1>
          <p className="mt-2 text-sm text-ink-3">
            Pay bills back home, from anywhere.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            {error && <p className="text-xs text-danger">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              Send code
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-ink/40">or</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <GoogleButton />
        </Card>

        <p className="mt-6 text-center text-xs text-ink-3">
          No password needed. We&apos;ll email you a one-time code.
        </p>
      </div>
    </main>
  );
}

function GoogleButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // In production, wire this up to Google Identity Services
  // (https://accounts.google.com/gsi/client) to obtain a real id_token,
  // then POST it here exactly the same way.
  async function handleGoogleCredential(idToken: string) {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.post("/api/v1/auth/google", { id_token: idToken });
      const { access_token, refresh_token } = res.data.data;
      const { setTokens } = await import("@/lib/auth");
      setTokens(access_token, refresh_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant="secondary"
        loading={loading}
        className="w-full"
        onClick={() => {
          // Placeholder: replace with the real Google Identity Services flow.
          // window.google.accounts.id.prompt() -> callback receives credential.idToken
          // -> handleGoogleCredential(credential.idToken)
          alert("Wire this button to Google Identity Services to get a real id_token.");
        }}
      >
        Continue with Google
      </Button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
