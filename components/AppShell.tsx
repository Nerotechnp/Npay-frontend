"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { User } from "@/types";

export interface ShellNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface AppShellProps {
  user: User;
  onLogout: () => void;
  navItems: ShellNavItem[];
  brandLabel?: string;
  children: ReactNode;
}

function initialsOf(user: User): string {
  const source = user.full_name || user.email || "?";
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AppShell({
  user,
  onLogout,
  navItems,
  brandLabel = "Npay",
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Lock background scroll while the mobile sidebar drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isActive = (item: ShellNavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");

  const sideContent = (
    <div className="relative flex h-full flex-col">
      {/* Soft brand glows, matching the login page background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-moss/[0.10] blur-[80px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-saffron/[0.12] blur-[80px]"
      />

      {/* Brand */}
      <div className="relative flex h-16 items-center justify-between px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-moss to-moss2 text-base font-extrabold tracking-tight text-white shadow-lg shadow-moss/25">
            N
          </span>
          <span className="text-[15px] font-bold tracking-tight text-ink">{brandLabel}</span>
        </Link>
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-paper hover:text-ink lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive({ href, label, icon: Icon, exact });
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-moss text-white shadow-sm shadow-moss/20"
                  : "text-ink-2 hover:bg-paper hover:text-ink"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r-full bg-moss" style={{ width: 3 }} />
              )}
              <Icon className="h-[1.15rem] w-[1.15rem]" />
              <span>{label}</span>
              {active && <ChevronRight className="ml-auto h-4 w-4 text-white/80" />}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="relative border-t border-line-2 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-paper px-3 py-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-moss to-moss2 text-sm font-bold text-white shadow-sm shadow-moss/25">
            {initialsOf(user)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink">{user.full_name || user.email}</p>
            <p className="truncate text-[11px] text-ink-3">
              {user.is_admin ? "Administrator" : "Member"}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Log out"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-white hover:text-danger"
          >
            <LogOut className="h-[1.15rem] w-[1.15rem]" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      {/* Shared full-bleed brand background (login-page style), rendered once */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden bg-paper">
        <div className="pointer-events-none absolute -top-40 right-0 h-[28rem] w-[28rem] rounded-full bg-moss/[0.08] blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-saffron/[0.10] blur-[100px]" />
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-line-2 bg-white lg:flex">
        {sideContent}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-64 max-w-[80%] overflow-hidden border-r border-line-2 bg-white shadow-2xl shadow-black/40 transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sideContent}
        </aside>
      </div>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line-2 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-paper"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-moss to-moss2 text-[13px] font-extrabold tracking-tight text-white">
              N
            </span>
            <span className="text-sm font-semibold text-ink">{brandLabel}</span>
          </Link>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
