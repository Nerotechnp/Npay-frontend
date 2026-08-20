"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import {
  GOOGLE_AUTH_STORAGE_KEY,
  postGoogleAuthResult,
  type GoogleAuthResult,
} from "@/lib/google-auth";

// This page is opened inside the Google OAuth popup (or a full-page tab on
// mobile). Google redirects it to <origin>/google/callback#id_token=... (implicit
// flow). We read the id_token from the URL fragment, exchange it ONCE for an Npay
// session via the backend, then hand the session back to the opener (which only
// stores it) and close. The opener finishes sign-in — no second backend call.
export default function GoogleCallback() {
  const [status, setStatus] = useState("Completing Google sign-in…");

  useEffect(() => {
    const finish = (result: GoogleAuthResult) => {
      const origin = window.location.origin;
      setStatus(result.ok ? "Signed in. Closing…" : result.error);
      postGoogleAuthResult(result, origin);
      if (result.ok) {
        setTimeout(() => window.close(), 300);
      } else {
        setTimeout(() => window.close(), 2000);
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
