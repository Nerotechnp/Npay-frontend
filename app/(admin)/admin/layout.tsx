"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Users, Package, Receipt, Network, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/transactions", label: "Transactions", icon: Receipt },
  { href: "/admin/gateways", label: "Gateways", icon: Network },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !user.is_admin)) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-ink/50">
        Loading…
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return null;
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Desktop sidebar — the only navigation on large screens */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line-2 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-line-2 px-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-moss text-sm font-extrabold tracking-tight text-white">
            N
          </span>
          <span className="text-base font-bold tracking-tight text-ink">Npay Admin</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive(href)
                  ? "bg-moss/10 text-moss"
                  : "text-ink-3 hover:bg-paper hover:text-ink"
              }`}
            >
              <Icon className="h-[1.125rem] w-[1.125rem]" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-line-2 p-4">
          <Link
            href="/dashboard"
            className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-3 transition-colors hover:bg-paper hover:text-ink"
          >
            <ShieldCheck className="h-[1.125rem] w-[1.125rem]" />
            Back to app
          </Link>
          <div className="flex items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink">{user.full_name || user.email}</p>
              <p className="truncate text-[11px] text-ink-3">{user.is_admin ? "Administrator" : "User"}</p>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              aria-label="Log out"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-red-50 hover:text-danger"
            >
              <LogOut className="h-[1.125rem] w-[1.125rem]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Page content — single bottom tab bar on mobile, no second top bar */}
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-10 lg:pt-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line-2 bg-white/95 backdrop-blur lg:hidden">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
              isActive(href) ? "text-moss" : "text-ink-3"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-ink-3"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </nav>
    </div>
  );
}
