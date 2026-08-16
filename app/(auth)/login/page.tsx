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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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
      }
    },
    [router]
  );

  // Render the branded GSI button (default popup mode — no redirect_uri config
  // needed in Google Cloud). On mobile the Google sheet is dismissed via the
  // browser Back button, which leaves GSI thinking a sign-in flow is still "in
  // progress", so the button goes dead. To recover we fully reset GSI (drop the
  // stale global + re-inject the script) when the user returns from a flow:
  // `focus`/`visibilitychange` (sheet/tab closed, main frame never went hidden)
  // and `popstate`/`pageshow` (Back/Forward, bfcache restore).
  //
  // On a normal page load these recovery events also fire, so we (1) only fully
  // reset GSI after a flow actually started (tracked via `blur`, since the main
  // window loses focus when the Google sheet opens), and (2) render the button at
  // most once per mount/reset. Without the once-guard a needless wipe + re-render
  // makes the button blink and shifts the layout up/down.
  useEffect(() => {
    if (!clientId) {
      setError("Google sign-in is not configured.");
      return;
    }

    let flowStarted = false;
    let rendered = false;

    const render = () => {
      const g = (window as any).google;
      if (!g?.accounts?.id || !btnRef.current) return;
      if (rendered) return;
      rendered = true;
      try {
        g.accounts.id.cancel();
      } catch {
        // no prompt open — ignore
      }
      try {
        btnRef.current.innerHTML = "";
      } catch {
        // ignore
      }
      g.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response?.credential) handleGoogleCredential(response.credential);
        },
        auto_select: false,
      });
      g.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        width: btnRef.current.clientWidth || 320,
        type: "standard",
        text: "continue_with",
      });
    };

    // Full reset: clear the frozen GSI instance and re-inject a fresh script so the
    // button is guaranteed to be interactive again after a dismissed/abandoned flow.
    const resetGsi = () => {
      rendered = false;
      try {
        (window as any).google = undefined;
      } catch {
        // ignore — re-injection redefines it anyway
      }
      const existing = document.getElementById("gsi-client-script");
      if (existing) existing.remove();
      const script = document.createElement("script");
      script.id = "gsi-client-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = render;
      script.onerror = () => setError("Failed to load Google sign-in.");
      document.body.appendChild(script);
    };

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) resetGsi();
    };
    const onPageHide = () => {
      try {
        (window as any).google?.accounts?.id?.cancel();
      } catch {
        // ignore
      }
    };
    // Main window loses focus when the Google sheet/popup opens.
    const onBlur = () => {
      flowStarted = true;
    };
    // Only reset if a flow was actually started, so a normal page load
    // (where focus/visibility also fire) doesn't wipe + re-render the button.
    const onVisible = () => {
      if (document.visibilityState === "visible" && flowStarted) resetGsi();
    };
    const onFocus = () => {
      if (flowStarted) {
        flowStarted = false;
        resetGsi();
      }
    };
    const onPopState = () => resetGsi();

    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("popstate", onPopState);
    document.addEventListener("visibilitychange", onVisible);

    const g = (window as any).google;
    if (g?.accounts?.id) render();
    else resetGsi();

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [clientId, handleGoogleCredential]);

  if (!clientId) {
    return <p className="text-xs text-danger">{error}</p>;
  }

  return (
    <div>
      <div ref={btnRef} className="flex min-h-[44px] w-full justify-center" />
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

