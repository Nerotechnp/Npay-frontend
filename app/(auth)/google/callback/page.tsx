"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import { setTokens } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
import {
  GOOGLE_AUTH_STORAGE_KEY,
  postGoogleAuthResult,
  type GoogleAuthResult,
} from "@/lib/google-auth";

// This page is opened inside the Google OAuth popup (desktop) or as a
// full-page redirect (mobile, where popups are blocked). Google redirects it to
// <origin>/google/callback#id_token=... (implicit flow). We read the id_token
// from the URL fragment, exchange it ONCE for an Npay session via the backend,
// then hand the session back: postMessage + close when there's an opener
// (desktop popup), or navigate ourselves when there isn't (mobile full-page).
export default function GoogleCallback() {
  const [status, setStatus] = useState("Completing Google sign-in…");

  useEffect(() => {
    const finish = (result: GoogleAuthResult) => {
      const origin = window.location.origin;
      if (result.ok) {
        const { access_token, refresh_token, user } = result.payload;
        setTokens(access_token, refresh_token);
        useAuthStore.getState().setUser(user);
      }
      postGoogleAuthResult(result, origin);

      if (window.opener) {
        setStatus(result.ok ? "Signed in. Closing…" : result.error);
        setTimeout(() => window.close(), result.ok ? 300 : 2000);
      } else {
        // No opener → we are the top-level page (mobile full-page flow).
        // Tokens are already in localStorage/cookie, so just navigate.
        window.location.href = result.ok ? "/dashboard" : "/login";
      }
    };

    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash || window.location.search);
    const idToken = params.get("id_token");
    const error = params.get("error");

    if (error) {
      finish({
        ok: false,
        error:
          error === "access_denied"
            ? "Google sign-in cancelled."
            : `Google sign-in failed (${error}).`,
      });
      return;
    }
    if (!idToken) {
      finish({ ok: false, error: "No credential returned from Google." });
      return;
    }

    apiClient
      .post("/api/v1/auth/google", { id_token: idToken })
      .then((res) => {
        const { access_token, refresh_token, user } = res.data.data;
        finish({ ok: true, payload: { access_token, refresh_token, user } });
      })
      .catch((err) => {
        const msg = err?.response?.data?.error || "Google sign-in failed.";
        finish({ ok: false, error: msg });
      });
  }, []);

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-paper px-4">
      <p className="text-sm text-ink-3">{status}</p>
    </main>
  );
}
