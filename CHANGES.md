# Npay Frontend — Mobile View & PWA Changes

Log of all UI/mobile fixes and the PWA (installable) work done on the frontend.

## 1. Dashboard layout — mobile + stable nav
**File:** `app/(dashboard)/layout.tsx`

- **Mobile nav fixed:** previously the top header showed all text labels (Services / History / Profile / Admin / Log out) which overflowed on small screens. Now labels are icon-only on mobile and the nav has `overflow-x-auto` + `shrink-0` so it never breaks layout.
- **Unified bottom nav (mobile):** added a fixed bottom navigation bar (`md:hidden`) shown on all dashboard pages — Services / History / Profile / Admin (if admin) / Log out — with active highlight, so every dashboard page shares the exact same nav.
- **Desktop nav:** kept the original top header nav (logo + menu) for `md+` and hid the bottom bar on desktop.
- **Stable layout (no vertical/horizontal jump when switching pages):** root changed to `flex min-h-screen flex-col bg-paper` and `<main>` got `flex-1`, so the content area always fills the viewport regardless of page height.

## 2. Admin layout — mobile drawer
**File:** `app/(admin)/admin/layout.tsx`

- The `260px` sidebar was always visible, crushing content to ~115px on phones.
- Now: a mobile top bar (logo + hamburger), a slide-in drawer sidebar (`fixed` + `translate-x` toggle) with a backdrop, and the static sidebar restored on `md+`.

## 3. Admin tables — mobile scroll
**Files:**
- `app/(admin)/admin/users/page.tsx`
- `app/(admin)/admin/products/page.tsx`
- `app/(admin)/admin/gateways/page.tsx`

- Table `<Card>` used `overflow-hidden` (clipped the table on mobile) → changed to `overflow-x-auto` so wide tables scroll horizontally. (Transactions table already used `overflow-x-auto`.)
- Page headers (title + "New product/gateway" button) changed from `justify-between` row to `flex-col gap-4 sm:flex-row` so they stack instead of colliding on small screens.

## 4. Global — stop scrollbar layout shift
**File:** `app/globals.css`

- Added `html { scrollbar-gutter: stable; }` so content does not shift left/right when the vertical scrollbar appears/disappears between short and long pages.

## 5. PWA — install from browser (mobile)
Made the app installable ("Add to Home Screen") on mobile.

**New files**
- `app/manifest.ts` — web app manifest (`display: standalone`, `start_url: /dashboard`, name/short_name, theme + background colors, icons).
- `app/icon.svg` — favicon (also auto-wired by Next `app/icon` convention).
- `public/icon.svg` — manifest icon (purpose `any`).
- `public/maskable-icon.svg` — manifest icon (purpose `maskable`).
- `public/sw.js` — minimal service worker: cache-first for static assets, API + navigations go to the network (auth-safe).
- `components/PWARegister.tsx` — registers `/sw.js`, but **only in production** (`NODE_ENV === 'production'`) so dev is unaffected.

**Edited files**
- `app/layout.tsx` — added `metadata.appleWebApp` + `metadata.icons`, and a `viewport` export with `themeColor: #dc2626`, `viewportFit: cover`.
- `app/providers.tsx` — mounted `<PWARegister />` inside the provider tree.

## 6. Mobile topup — early carrier detection
**Files:** `app/(dashboard)/topup/page.tsx`, `Npay-backend/internal/handlers/config_handler.go`

- Backend `POST /api/v1/products/detect` now accepts **≥3 digits** (instead of exactly 10) and uses the first 3 as the prefix, so the carrier can be recognized from the prefix.
- **Frontend carrier detection is now fully client-side and instant** — it matches the 3-digit prefix against the `phone_prefixes` of the already-loaded `products` (from `useServices()`), so there is **no network/API call at all**. This removed the mobile latency that made detection feel slow. The `useDetectProduct` backend hook is no longer used by the topup flow.
- `Continue` now validates the number is **exactly 10 digits** ("Enter a valid 10-digit Nepal mobile number").
- Phone input upgraded for mobile: `type="tel"`, `inputMode="numeric"`, `maxLength={10}`, and strips non-digits on change (numeric keypad, no stray characters).

## Notes
- All changes pass `npx tsc --noEmit`.
- Install prompt requires **production + HTTPS** (Android Chrome also needs the service worker, which only registers in production). For local testing use `npm run build && npm run start` over HTTPS/localhost.
- Icons are now **PNG** (generated from the SVG sources via `@resvg/resvg-js`):
  - `public/icon-192.png` (192×192, purpose `any`)
  - `public/icon-512.png` (512×512, purpose `any`)
  - `public/maskable-512.png` (512×512, purpose `maskable`)
  - Manifest (`app/manifest.ts`) references these PNGs; `app/layout.tsx` uses `icon-512.png` as the iOS `apple-touch-icon`. This satisfies Android Chrome's strict 192px + 512px PNG installability rule.
  - The original `app/icon.svg` / `public/icon.svg` / `public/maskable-icon.svg` are kept (favicon + source). `scripts/gen-icons.mjs` was a temporary generator and was removed.
