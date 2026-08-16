"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, LayoutGrid, Receipt, Plug, ArrowLeft, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/products", label: "Products", icon: LayoutGrid },
  { href: "/admin/transactions", label: "Transactions", icon: Receipt },
  { href: "/admin/gateways", label: "Gateways", icon: Plug },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-ink/50">
        Loading…
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  if (!user.is_admin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-4 text-center">
        <p className="text-sm text-ink/60">You don&apos;t have access to the admin panel.</p>
        <Link href="/dashboard" className="text-sm font-medium text-moss hover:underline">
          Back to Npay
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line-2 bg-white px-4 md:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-moss text-[13px] font-extrabold tracking-tight text-white">
            N
          </span>
          <span className="text-sm font-semibold text-ink">Admin</span>
        </Link>
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-paper hover:text-ink"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Backdrop (mobile only) */}
      {menuOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-ink/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] shrink-0 flex-col border-r border-line-2 bg-paper transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:sticky md:top-0 md:h-screen`}
      >
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-moss text-[13px] font-extrabold tracking-tight text-white">
            N
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Npay</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-ink-3">Admin Console</p>
          </div>
        </div>
        <p className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-3">Navigation</p>
        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                  active ? "bg-red-50 text-ink" : "text-ink-3 hover:bg-white hover:text-ink"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-r-full bg-moss" />
                )}
                <Icon className="h-[1.125rem] w-[1.125rem] text-moss" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-3">
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-3 hover:bg-white hover:text-ink"
          >
            <ArrowLeft className="h-[1.125rem] w-[1.125rem]" />
            Back to Npay
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden px-4 py-6 text-sm text-ink sm:px-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
