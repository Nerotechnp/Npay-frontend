import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth is enforced client-side by the dashboard/admin layout guards, which
// read the token from localStorage. That is reliable across devices — including
// mobile browsers where a JS-set cookie may not be forwarded to the edge
// middleware. We intentionally do NOT redirect here, to avoid a middleware
// <-> login-page redirect loop on clients that don't send the cookie.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/services/:path*", "/transactions/:path*", "/profile/:path*", "/admin/:path*"],
};
