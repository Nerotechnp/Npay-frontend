"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import apiClient from "@/lib/api-client";
import { getAccessToken } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
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

  // Focus the email field without scrolling the page, so mobile reloads don't
  // jump up/down when the browser tries to bring the autofocused input into view.
  useEffect(() => {
    const el = document.getElementById("email") as HTMLInputElement | null;
    const coarse = window.matchMedia?.("(pointer: coarse)").matches;
    if (el && !coarse) el.focus({ preventScroll: true });
  }, []);

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
    <main className="relative flex min-h-[100svh] flex-col items-center justify-start bg-paper px-4 pt-[12svh] pb-10">
      <Link
        href="/"
        aria-label="Back to home"
        className="absolute left-4 top-4 flex h-12 items-center gap-2 rounded-full px-4 text-ink-3 transition-colors hover:bg-paper hover:text-ink sm:left-6 sm:top-6"
      >
        <MoveLeft className="h-6 w-10" strokeWidth={2.5} />
        <span className="text-sm font-medium">Back</span>
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
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const btnRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<any>(null);

  const handleCredential = useCallback(
    async (idToken: string) => {
      try {
        const res = await apiClient.post("/api/v1/auth/google", { id_token: idToken });
        const { access_token, refresh_token, user } = res.data.data;
        const { setTokens } = await import("@/lib/auth");
        setTokens(access_token, refresh_token);
        useAuthStore.getState().setUser(user);
        // Hard navigation (not router.push) so the freshly-set token cookie is
        // sent on the first request — a soft push can reach the middleware
        // before the cookie is applied, bouncing back to /login.
        window.location.href = "/dashboard";
      } catch (err: any) {
        setError(err?.response?.data?.error || "Google sign-in failed.");
      }
    },
    []
  );

  // Render Google's own "Continue with Google" button, which returns an ID
  // token (response.credential) directly. renderButton() reliably opens the
  // account chooser for both signed-in and signed-out users (unlike the OAuth2
  // token client, which only returns an access token, and prompt(), which can
  // fail with a FedCM NetworkError).
  const renderGoogleButton = useCallback(() => {
    const g = gRef.current;
    if (!g?.accounts?.id || !btnRef.current) return;
    btnRef.current.innerHTML = "";
    g.accounts.id.renderButton(btnRef.current, {
      theme: "outline",
      size: "large",
      width: btnRef.current.clientWidth || 320,
      text: "continue_with",
    });
  }, []);

  useEffect(() => {
    if (!clientId) {
      setError("Google sign-in is not configured.");
      return;
    }

    const init = () => {
      const g = (window as any).google;
      if (!g?.accounts?.id) return;
      gRef.current = g;
      g.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response?.credential) handleCredential(response.credential);
          else setError("Google sign-in failed.");
        },
      });
      renderGoogleButton();
      setReady(true);
    };

    if ((window as any).google?.accounts?.id) {
      init();
      return;
    }

    const existing = document.getElementById("gsi-client-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "gsi-client-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = init;
      script.onerror = () => setError("Failed to load Google sign-in.");
      document.body.appendChild(script);
    } else {
      existing.addEventListener("load", init, { once: true });
    }

    // If the user cancels the Google account chooser, the rendered button can
    // get stuck in a spinner state. Re-render a fresh button when focus returns.
    const onFocus = () => {
      if (ready) setTimeout(renderGoogleButton, 300);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [clientId, handleCredential, renderGoogleButton, ready]);

  if (!clientId) {
    return <p className="text-xs text-danger">{error}</p>;
  }

  return (
    <div>
      <div ref={btnRef} className="flex w-full justify-center" />
      {!ready && (
        <button
          type="button"
          disabled
          className="flex h-[44px] w-full items-center justify-center rounded-lg border border-line-2 bg-white px-4 text-sm font-medium text-ink/60"
        >
          Continue with Google
        </button>
      )}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

