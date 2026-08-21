"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Users, Package, Receipt, Network, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAccessToken } from "@/lib/auth";
import { AppShell, type ShellNavItem } from "@/components/AppShell";

const navItems: ShellNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/transactions", label: "Transactions", icon: Receipt },
  { href: "/admin/gateways", label: "Gateways", icon: Network },
  { href: "/dashboard", label: "Back to app", icon: ArrowLeft },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !user.is_admin) && !getAccessToken()) {
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

  return (
    <AppShell
      user={user}
      brandLabel="Npay Admin"
      navItems={navItems}
      onLogout={() => {
        logout();
        router.push("/login");
      }}
    >
      {children}
    </AppShell>
  );
}
