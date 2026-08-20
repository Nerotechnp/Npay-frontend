"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import { setTokens } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";

// This page is opened inside the Google OAuth popup. Google redirects it to
// <origin>/google/callback#id_token=... (implicit flow). We read the id_token
// from the URL fragment, exchange it for an Npay session via the backend, then
// post the result back to the opener window (which finishes sign-in) and close.
export default function GoogleCallback() {
  const [status, setStatus] = useState("Completing Google sign-in…");

  useEffect(() => {
    const done = (idToken: string | null, errMsg: string | null) => {
      const origin = window.location.origin;
      if (errMsg) {
        setStatus(errMsg);
        window.opener?.postMessage({ type: "google-signin-error", error: errMsg }, origin);
        setTimeout(() => window.close(), 1800);
        return;
      }
      apiClient
        .post("/api/v1/auth/google", { id_token: idToken })
        .then((res) => {
          const { access_token, refresh_token, user } = res.data.data;
          setTokens(access_token, refresh_token);
          useAuthStore.getState().setUser(user);
          window.opener?.postMessage({ type: "google-signin", idToken }, origin);
          window.close();
        })
        .catch((err) => {
          const msg = err?.response?.data?.error || "Google sign-in failed.";
          setStatus(msg);
          window.opener?.postMessage({ type: "google-signin-error", error: msg }, origin);
          setTimeout(() => window.close(), 2000);
        });
    };

    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash || window.location.search);
    const idToken = params.get("id_token");
    const error = params.get("error");

    if (error) {
      done(null, error === "access_denied" ? "Google sign-in cancelled." : `Google sign-in failed (${error}).`);
    } else if (idToken) {
      done(idToken, null);
    } else {
      done(null, "No credential returned from Google.");
    }
  }, []);

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-paper px-4">
      <p className="text-sm text-ink-3">{status}</p>
    </main>
  );
}
