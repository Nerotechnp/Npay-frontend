"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
    <main className="relative flex min-h-[100svh] items-center justify-center bg-paper px-4 py-10">
      <Link
        href="/"
        aria-label="Back to home"
        className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-paper hover:text-ink sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-moss text-lg font-extrabold tracking-tight text-white">
            N
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Welcome to Npay
          </h1>
          <p className="mt-2 text-sm text-ink-3">
            Pay bills back home, from anywhere.
          </p>
        </div>

        <Card className="p-5 sm:p-6">
          <GoogleButton />

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-ink/40">or</span>
            <div className="h-px flex-1 bg-line" />
          </div>

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
  const [scriptReady, setScriptReady] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("Google sign-in is not configured.");
      return;
    }

    const existing = document.getElementById("gsi-client-script") as HTMLScriptElement | null;
    const script = existing || document.createElement("script");
    if (!existing) {
      script.id = "gsi-client-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
    }

    script.onload = () => {
      const g = (window as any).google;
      if (!g?.accounts?.id || !btnRef.current) return;
      g.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response?.credential) handleGoogleCredential(response.credential);
        },
      });
      g.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        width: btnRef.current.clientWidth || 320,
        type: "standard",
        text: "continue_with",
      });
      setScriptReady(true);
    };
    script.onerror = () => setError("Failed to load Google sign-in.");
    if (!existing) document.body.appendChild(script);
  }, []);

  return (
    <div>
      <div ref={btnRef} className="flex w-full justify-center" />
      {!scriptReady && (
        <Button
          type="button"
          variant="secondary"
          loading={loading}
          className="w-full"
          disabled
        >
          Continue with Google
        </Button>
      )}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

