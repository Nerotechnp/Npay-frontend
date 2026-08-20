// Shared channel between the Google OAuth popup (app/(auth)/google/callback)
// and the login page (app/(auth)/login). The popup does the single token
// exchange with the backend and hands the Npay session back to the opener.
//
// We use two delivery mechanisms for robustness:
//   1. postMessage  -> works for a real popup window (window.opener set)
//   2. localStorage + "storage" event -> works when the "popup" opens as a
//      full-page tab on mobile, where window.opener may be null/unreliable.
export const GOOGLE_AUTH_STORAGE_KEY = "npay_google_auth";

import type { User } from "@/types";

export interface GoogleAuthPayload {
  access_token: string;
  refresh_token?: string;
  user: User;
}

export type GoogleAuthResult =
  | { ok: true; payload: GoogleAuthPayload }
  | { ok: false; error: string };

export function postGoogleAuthResult(result: GoogleAuthResult, origin: string) {
  try {
    localStorage.setItem(GOOGLE_AUTH_STORAGE_KEY, JSON.stringify(result));
  } catch {
    /* storage may be unavailable (private mode); postMessage still works */
  }
  if (typeof window !== "undefined" && window.opener) {
    window.opener.postMessage(
      result.ok
        ? { type: "google-signin", payload: result.payload }
        : { type: "google-signin-error", error: result.error },
      origin
    );
  }
}
