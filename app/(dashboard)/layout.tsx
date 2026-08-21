"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Receipt, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAccessToken } from "@/lib/auth";
import { AppShell, type ShellNavItem } from "@/components/AppShell";

const navItems: ShellNavItem[] = [
  { href: "/dashboard", label: "Services", icon: LayoutGrid, exact: true },
  { href: "/transactions", label: "History", icon: Receipt },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
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

  const items = navItems.filter((i) => i.href !== "/admin" || user.is_admin);

  return (
    <AppShell
      user={user}
      brandLabel="Npay"
      navItems={items}
      onLogout={() => {
        logout();
        router.push("/login");
      }}
    >
      {children}
    </AppShell>
  );
}
