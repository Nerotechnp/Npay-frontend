"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoveLeft, ShieldCheck, Globe, Zap } from "lucide-react";
import apiClient from "@/lib/api-client";
import { getAccessToken, setTokens } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
import {
  GOOGLE_AUTH_STORAGE_KEY,
  type GoogleAuthPayload,
  type GoogleAuthResult,
} from "@/lib/google-auth";
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
        href="/"
        aria-label="Back to home"
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
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Welcome back</h1>
          <p className="mt-2 text-sm text-ink-3">
            Pay bills back home, from anywhere. Sign in to continue.
          </p>
        </div>

        <Card className="p-6 shadow-md shadow-moss/5 sm:p-7">
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
            {error && (
              <div className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-xs text-danger">
                {error}
              </div>
            )}
            <Button type="submit" loading={loading} className="mt-1 w-full py-3 text-base">
              Send code
            </Button>
          </form>
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
          No password needed. We&apos;ll email you a one-time code.
        </p>
      </div>
    </main>
  );
}

function GoogleButton() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const router = useRouter();
  // Guards against the result arriving twice (postMessage + storage event).
  const finishedRef = useRef(false);

  const finishLogin = useCallback((payload: GoogleAuthPayload) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setTokens(payload.access_token, payload.refresh_token);
    useAuthStore.getState().setUser(payload.user);
    // Hard navigation so the freshly-set token is sent on the first request
    // (a client-side router.push can miss it, bouncing /dashboard -> /login).
    window.location.href = "/dashboard";
  }, []);

  const failLogin = useCallback((msg: string) => {
    if (finishedRef.current) return;
    setError(msg);
    setLoading(false);
  }, []);

  // Receive the Npay session from the popup. postMessage covers a real popup;
  // the "storage" event covers mobile, where the "popup" may open as a
  // full-page tab with window.opener unreliable.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "google-signin" && e.data?.payload) {
        finishLogin(e.data.payload as GoogleAuthPayload);
      } else if (e.data?.type === "google-signin-error") {
        failLogin(e.data.error || "Google sign-in failed.");
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== GOOGLE_AUTH_STORAGE_KEY || !e.newValue) return;
      try {
        const result = JSON.parse(e.newValue) as GoogleAuthResult;
        if (result.ok) finishLogin(result.payload);
        else failLogin(result.error);
      } catch {
        /* ignore malformed payloads */
      } finally {
        localStorage.removeItem(GOOGLE_AUTH_STORAGE_KEY);
      }
    };
    window.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("storage", onStorage);
    };
  }, [finishLogin, failLogin]);

  const handleGoogle = useCallback(() => {
    if (!clientId) {
      setError("Google sign-in is not configured.");
      return;
    }
    if (finishedRef.current) return;
    setError("");

    const redirectUri = `${window.location.origin}/google/callback`;
    const rand = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "id_token",
      scope: "openid email profile",
      nonce: rand(),
      state: rand(),
      prompt: "select_account",
    });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    // Popups are blocked/unreliable on mobile and some embedded browsers, so
    // fall back to a full-page redirect there (and whenever a popup can't open).
    // In that flow the /google/callback page navigates back to /dashboard itself.
    const coarse = window.matchMedia?.("(pointer: coarse)").matches;
    if (coarse) {
      setLoading(true);
      window.location.href = authUrl;
      return;
    }
    const popup = window.open(authUrl, "google-signin", "width=480,height=640");
    if (!popup) {
      setLoading(true);
      window.location.href = authUrl;
      return;
    }
    // If the user closes the popup without completing, reset the button.
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        if (!finishedRef.current) {
          setLoading(false);
          setError("Google sign-in was cancelled.");
        }
      }
    }, 500);
  }, [clientId, router]);

  if (!clientId) {
    return <p className="text-xs text-danger">{error}</p>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="flex h-[44px] w-full items-center justify-center gap-3 rounded-lg border border-line-2 bg-white px-4 text-sm font-medium text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Spinner /> : <GoogleGIcon />}
        {loading ? "Signing in…" : "Continue with Google"}
      </button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-ink-3"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}

// Inline 4-colour Google "G" so the button looks like the standard
// "Continue with Google" without loading an extra asset.
function GoogleGIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6.01C43.93 39.05 46.98 34.11 46.98 24.55z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6.01c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

