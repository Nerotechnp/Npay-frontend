"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Receipt, User, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAccessToken } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Services", icon: LayoutGrid },
  { href: "/transactions", label: "History", icon: Receipt },
  { href: "/profile", label: "Profile", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && !getAccessToken()) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-ink/50">
        Loading…
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-20 border-b border-line-2/80 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-6">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-moss text-[13px] font-extrabold tracking-tight text-white">
              N
            </span>
            <span className="text-sm font-semibold text-ink">Npay</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
                    active ? "bg-red-50 text-ink" : "text-ink-3 hover:bg-paper hover:text-ink"
                  }`}
                >
                  <Icon className="h-[1.125rem] w-[1.125rem]" />
                  {label}
                </Link>
              );
            })}
            {user.is_admin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-3 hover:bg-paper hover:text-ink"
              >
                <ShieldCheck className="h-[1.125rem] w-[1.125rem]" />
                Admin
              </Link>
            )}
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="ml-1 flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-3 hover:bg-red-50 hover:text-danger"
            >
              <LogOut className="h-[1.125rem] w-[1.125rem]" />
              Log out
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-8 text-sm text-ink md:px-6 md:pb-8">{children}</main>

      {/* Mobile bottom navigation — unified across all dashboard pages */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line-2 bg-white/95 backdrop-blur md:hidden">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                active ? "text-moss" : "text-ink-3"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
        {user.is_admin && (
          <Link
            href="/admin"
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
              pathname.startsWith("/admin") ? "text-moss" : "text-ink-3"
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
            Admin
          </Link>
        )}
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
