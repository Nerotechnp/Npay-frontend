# npay-frontend (Next.js) np

Matches the `Npay-backend` Go API: passwordless login (email OTP + Google),
service catalog, payment flow, transaction history.

> ⚠️ Written without network access to run `npm install` / `next build`, so
> treat it as unverified until you run it locally. Logic and structure are
> complete; run the steps below to catch anything the compiler flags.

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS
- @tanstack/react-query for server state
- Zustand for auth state
- Axios with automatic access-token refresh on 401

## Design notes

Palette: deep moss green (`#1F4B3F`) as the trust/money primary, warm paper
background (`#F7F5F0`), a single marigold accent (`#E7A93C`) used sparingly
for pending/attention states — a nod to Nepali visual warmth without leaning
on flag colors literally. Fraunces (serif display) for headings against Inter
for body/UI, so the product feels considered rather than templated-fintech.

## Project layout

```
app/(auth)/login, verify-otp        passwordless auth flow
app/(dashboard)/dashboard           service catalog (protected)
app/(dashboard)/services/[id]       payment form for one service
app/(dashboard)/transactions        history + receipt detail
app/(dashboard)/profile             edit name/country
app/(admin)/admin                   admin panel (protected + is_admin gated)
  ├── page.tsx                      dashboard stat cards
  ├── users/                        search, block/unblock, promote to admin
  ├── services/                     CRUD + activate/deactivate
  ├── transactions/                 list, filter by status, manual status override
  └── gateways/                     CRUD for payment + provider gateways, credential rotation
components/                         ServiceCard, TransactionReceipt, OTPInput, ui/*, admin/*
hooks/                              useAuth, useServices, useTransactions
hooks/admin/                        useAdminStats, useAdminUsers, useAdminServices, useAdminTransactions, useAdminGateways
lib/                                api-client (axios + refresh), auth (token storage), format
store/                              authStore (zustand)
middleware.ts                       redirects unauthenticated users to /login, covers /admin too
```

## First run

```bash
cp .env.example .env.local
# set NEXT_PUBLIC_API_URL to wherever Npay-backend is running (default http://localhost:8080)

npm install
npm run dev
```

Open http://localhost:3000 — it redirects to `/login`.

## What's real vs. stubbed

| Piece | Status |
|---|---|
| OTP login (request → verify → JWT stored) | Fully wired to the backend's `/api/v1/auth/otp/*` |
| Token refresh on 401 | Implemented in `lib/api-client.ts` |
| Service list, payment form, transaction creation, payment initiation | Fully wired to the backend |
| Transaction status polling | Polls every 3s while `pending`/`processing`, matching the backend's webhook-driven flow |
| **Google Sign-In** | UI button exists but is **not wired to Google Identity Services** — it's a placeholder `alert()`. Load `https://accounts.google.com/gsi/client`, get a real `id_token` from a Google credential response, and pass it to the same `handleGoogleCredential` function already written |
| **Exchange rate** | Hardcoded `NPR_PER_USD = 133.5` in the service payment form. Replace with a live rate from your backend (which should itself follow NRB's published rate, per the backend's compliance notes) |
| Multi-currency rates for AUD/GBP/CAD/EUR | Currency selector exists but all use the same hardcoded USD rate — needs a real per-currency rate source |

## Admin panel

Visiting `/admin` (or clicking the shield icon in the top nav, shown only to
users where `is_admin` is true) opens a separate layout with its own sidebar:

- **Overview** — user/transaction counts, revenue, pending/failed breakdown
- **Users** — search, block/unblock, promote/revoke admin (you can't act on your own account, matching the backend's self-lockout protection)
- **Services** — full CRUD, hide/show without deleting, assign a gateway
- **Transactions** — filter by status, manual status override (with a confirm prompt — this bypasses the normal payment→fulfillment flow, use it deliberately)
- **Gateways** — add/edit/disable/delete payment and provider gateways; API key/secret fields are always blank on load and only sent if you type something, so editing a gateway's name never risks blanking its credentials

Non-admin users who land on `/admin` see a plain "you don't have access" message
instead of the panel — the check happens client-side against the `/user/profile`
response (`is_admin`), matching the backend's `AdminOnly` middleware.

## Next steps for you

1. `npm install && npm run build` — first real compile check
2. Wire Google Identity Services into `app/(auth)/login/page.tsx`
3. Replace the hardcoded exchange rate with a backend-provided rate endpoint
4. Point `NEXT_PUBLIC_API_URL` at your deployed backend and test the full loop end to end
