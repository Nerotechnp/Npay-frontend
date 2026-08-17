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
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  // Google OAuth2 token client + guards. busyRef blocks double-firing the
  // popup; callbackFiredRef / popupTimeoutRef recover the UI if the popup is
  // closed without Google ever invoking our callback (e.g. the X button).
  const tokenClientRef = useRef<any>(null);
  const busyRef = useRef(false);
  const callbackFiredRef = useRef(false);
  const popupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearBusy = useCallback(() => {
    setLoading(false);
    setError("");
    busyRef.current = false;
    callbackFiredRef.current = false;
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
      popupTimeoutRef.current = null;
    }
  }, []);

  const handleGoogleCredential = useCallback(
    async (idToken: string) => {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.post("/api/v1/auth/google", { id_token: idToken });
        const { access_token, refresh_token, user } = res.data.data;
        const { setTokens } = await import("@/lib/auth");
        setTokens(access_token, refresh_token);
        useAuthStore.getState().setUser(user);
        router.push("/dashboard");
      } catch (err: any) {
        setError(err?.response?.data?.error || "Google sign-in failed.");
      } finally {
        setLoading(false);
        busyRef.current = false;
      }
    },
    [router]
  );

  // Load Google Identity Services once and build an OAuth2 token client. Using
  // the OAuth2 popup (instead of One Tap's prompt()) guarantees the Google
  // account chooser opens for *every* user — One Tap only appears for people
  // who already have a Google session, so prompt() did nothing for signed-out
  // users. The token response still carries an `id_token` for our backend.
  useEffect(() => {
    if (!clientId) {
      setError("Google sign-in is not configured.");
      return;
    }

    const initGsi = () => {
      const g = (window as any).google;
      if (!g?.accounts?.oauth2) return;
      tokenClientRef.current = g.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: (response: any) => {
          callbackFiredRef.current = true;
          if (popupTimeoutRef.current) {
            clearTimeout(popupTimeoutRef.current);
            popupTimeoutRef.current = null;
          }
          if (response?.error) {
            // Popup closed or consent denied — a cancellation, not a failure.
            if (
              response.error !== "popup_closed_by_user" &&
              response.error !== "access_denied"
            ) {
              setError("Google sign-in was interrupted.");
            }
            setLoading(false);
            busyRef.current = false;
            return;
          }
          if (response?.id_token) handleGoogleCredential(response.id_token);
          else {
            setLoading(false);
            busyRef.current = false;
          }
        },
      });
      setGsiReady(true);
    };

    if ((window as any).google?.accounts?.oauth2) {
      initGsi();
      return;
    }

    const existing = document.getElementById("gsi-client-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "gsi-client-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = initGsi;
      script.onerror = () => setError("Failed to load Google sign-in.");
      document.body.appendChild(script);
    } else {
      existing.addEventListener("load", initGsi, { once: true });
    }

    // When the Google popup closes, focus returns to this window. If Google
    // never fired our callback (common when the popup is closed via X), reset
    // the stuck "Please wait…" state shortly after focus returns.
    const onFocus = () => {
      if (busyRef.current && !callbackFiredRef.current) {
        setTimeout(() => {
          if (busyRef.current && !callbackFiredRef.current) clearBusy();
        }, 600);
      }
    };
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
        popupTimeoutRef.current = null;
      }
    };
  }, [clientId, handleGoogleCredential, clearBusy]);

  const openGoogle = () => {
    const client = tokenClientRef.current;
    if (!client) {
      setError("Google sign-in is not available.");
      return;
    }
    if (busyRef.current) return;
    busyRef.current = true;
    callbackFiredRef.current = false;
    setError("");
    setLoading(true);
    // Ultimate fallback: if neither success nor error fires (e.g. popup left
    // open or closed in a way that bypasses our focus listener), release the
    // "Please wait…" state after two minutes.
    popupTimeoutRef.current = setTimeout(() => clearBusy(), 120_000);
    client.requestAccessToken();
  };

  if (!clientId) {
    return <p className="text-xs text-danger">{error}</p>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={openGoogle}
        disabled={loading || !gsiReady}
        className="flex h-[44px] w-full items-center justify-center gap-3 rounded-lg border border-line-2 bg-white px-4 transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleGIcon />
        <span className="text-sm font-medium text-ink">
          {loading ? "Please wait…" : "Continue with Google"}
        </span>
      </button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

function GoogleGIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6.01C43.94 39.05 46.98 34.13 46.98 24.55z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6.01c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

