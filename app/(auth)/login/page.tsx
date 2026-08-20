"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoveLeft, ShieldCheck, Globe, Zap } from "lucide-react";
import apiClient from "@/lib/api-client";
import { getAccessToken, setTokens } from "@/lib/auth";
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
  const [ready, setReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const btnRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<any>(null);

  const router = useRouter();

  const handleCredential = useCallback(
    async (idToken: string) => {
      try {
        const res = await apiClient.post("/api/v1/auth/google", { id_token: idToken });
        const { access_token, refresh_token, user } = res.data.data;
        setTokens(access_token, refresh_token);
        useAuthStore.getState().setUser(user);
        // Hard navigation so the freshly-set token cookie is sent on the
        // first request (a client-side router.push can miss it, bouncing
        // /dashboard -> /login before settling on the dashboard).
        window.location.href = "/dashboard";
      } catch (err: any) {
        setError(err?.response?.data?.error || "Google sign-in failed.");
      }
    },
    [router]
  );

  const readyRef = useRef(false);
  const handleCredentialRef = useRef<((idToken: string) => void) | undefined>(undefined);
  useEffect(() => {
    handleCredentialRef.current = handleCredential;
  }, [handleCredential]);

  // Render Google's own "Continue with Google" button, which returns an ID
  // token (response.credential) directly. renderButton() reliably opens the
  // account chooser for both signed-in and signed-out users (unlike the OAuth2
  // token client, which only returns an access token, and prompt(), which can
  // fail with a FedCM NetworkError).
  // Tracks when the button was last (re)rendered so recovery logic can skip a
  // re-render that lands immediately after a fresh render (e.g. the window
  // "focus" event that fires on initial page load), which would otherwise flash
  // the button and look like a jump.
  const lastRenderTs = useRef(0);

  const renderGoogleButton = useCallback(() => {
    const g = gRef.current;
    if (!g?.accounts?.id || !btnRef.current) return;
    // Render into a brand-new child node every time. After the user cancels the
    // chooser, GSI can leave the rendered button in a "processing"/disabled
    // state that re-rendering into the SAME node doesn't clear (especially on
    // mobile). A fresh node forces GSI to build a new, clickable button widget.
    btnRef.current.innerHTML = "";
    const slot = document.createElement("div");
    btnRef.current.appendChild(slot);
    g.accounts.id.renderButton(slot, {
      theme: "outline",
      size: "large",
      width: btnRef.current.clientWidth || 320,
      text: "continue_with",
    });
    lastRenderTs.current = Date.now();
  }, []);

  // Set true only once the user has actually opened the chooser. Recovery
  // re-renders are gated on this so we never re-render (and flash the GSI
  // iframe) on the initial page load — only after a real open/dismiss cycle.
  const interactedRef = useRef(false);

  useEffect(() => {
    if (!clientId) {
      setError("Google sign-in is not configured.");
      return;
    }

    const init = () => {
      const g = (window as any).google;
      if (!g?.accounts?.id) return;
      gRef.current = g;
      // Initialize only once: calling google.accounts.id.initialize() repeatedly
      // triggers the GSI "called multiple times" warning and only the last
      // instance is kept. A ref guard also covers the rare case the effect re-runs.
      if (!gRef.current.__gsiInitialized) {
        g.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response?.credential) handleCredentialRef.current?.(response.credential);
            else setError("Google sign-in failed.");
          },
        });
        gRef.current.__gsiInitialized = true;
      }
      renderGoogleButton();
      readyRef.current = true;
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

    // If the user cancels/dismisses the Google account chooser, the rendered
    // button can get stuck in a "processing" spinner and stop responding to
    // clicks. Re-render a fresh button to recover. Desktop fires `focus` when the
    // chooser closes; mobile in-page sheets often don't, so also recover on
    // `visibilitychange` (returning from an external chooser app) and on a short
    // delay after any click on the button itself.
    const recover = (minGap = 800) => {
      // Only recover after the user has opened the chooser (interactedRef). On
      // initial load the window "focus" event would otherwise trigger a needless
      // re-render that flashes the GSI iframe. minGap also skips a re-render that
      // lands right after a fresh render.
      if (
        interactedRef.current &&
        readyRef.current &&
        Date.now() - lastRenderTs.current > minGap
      ) {
        setTimeout(renderGoogleButton, 300);
      }
    };
    const onFocus = () => recover();
    const onVisibility = () => {
      if (document.visibilityState === "visible") recover();
    };
    // Mobile "back" often restores the page from bfcache, where focus/visibility
    // don't fire reliably — pageshow does, so recovery still runs there.
    const onPageShow = () => recover();
    const onResize = () => recover();
    const onClickCapture = () => {
      // Mark that a chooser session started; recovery (re-render) is now allowed
      // so a dismissal/cancel leaves the button clickable again.
      interactedRef.current = true;
      if (readyRef.current) setTimeout(renderGoogleButton, 1500);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("resize", onResize);
    btnRef.current?.addEventListener("click", onClickCapture, true);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("resize", onResize);
      btnRef.current?.removeEventListener("click", onClickCapture, true);
    };
    // Mount once: deps are stable (clientId is a constant, renderGoogleButton is
    // a stable useCallback). `ready` is intentionally excluded — gating on it
    // re-ran the effect and double-initialized GSI.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, renderGoogleButton]);

  if (!clientId) {
    return <p className="text-xs text-danger">{error}</p>;
  }

  return (
    // The btnRef container stays mounted at all times (GSI writes its button
    // straight into it, so React must not manage its children). The height is
    // locked to 44px and the loading skeleton is absolutely positioned, so the
    // only thing that changes is the button itself appearing inside the same
    // reserved box — neighbours never shift, and there is no content-swap flash.
    <div className="relative h-[44px]">
      <div ref={btnRef} className="flex h-[44px] w-full justify-center" />
      {!ready && (
        <div className="absolute inset-0 h-[44px] w-full rounded-lg bg-line" />
      )}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

