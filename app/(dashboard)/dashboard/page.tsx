"use client";

import { Smartphone, Zap, Droplets, Mountain, Package, Wifi, ArrowRight } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const categoryIcon: Record<string, any> = {
  mobile_topup: Smartphone,
  internet: Wifi,
  mobile_pack: Package,
  utility: Droplets,
  transport: Mountain,
};

// Products with these categories are collapsed into one tile on the dashboard.
// The user lands on a page where the provider is auto-detected (e.g. from the
// phone number prefix for mobile topups).
const GROUPED_CATEGORIES = ["mobile_topup", "internet", "mobile_pack"];

const CATEGORY_LABEL: Record<string, string> = {
  mobile_topup: "Mobile Topup",
  internet: "Internet",
  mobile_pack: "Mobile Pack",
  utility: "Utility",
  transport: "Transport",
};

function useFirstName() {
  const { user } = useAuth();
  if (!user) return "";
  const source = user.full_name || user.email || "";
  const first = source.split(" ")[0];
  return first.includes("@") ? first.split("@")[0] : first;
}

export default function DashboardPage() {
  const { data: products, isLoading, isError } = useServices();
  const router = useRouter();
  const firstName = useFirstName();

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-48 animate-pulse rounded-lg bg-line" />
        <p className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-line" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-line" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="font-display text-2xl text-ink">What would you like to pay?</h1>
        <p className="mt-8 text-sm text-danger">Couldn&apos;t load products. Check your connection and try again.</p>
      </div>
    );
  }

  const active = (products || []).filter((p) => p.is_active);

  // Build the list of dashboard tiles: grouped categories collapse to one, others stay individual.
  // Order is driven by the backend (products.display_order), so no client-side sorting is needed.
  const tiles: Array<{ key: string; name: string; category: string; icon: any; items: any[]; href: string }> = [];
  const groupedSeen = new Set<string>();

  for (const p of active) {
    if (GROUPED_CATEGORIES.includes(p.category)) {
      if (groupedSeen.has(p.category)) continue;
      groupedSeen.add(p.category);
      tiles.push({
        key: `group-${p.category}`,
        name: CATEGORY_LABEL[p.category] || p.category,
        category: p.category,
        icon: categoryIcon[p.category] || Zap,
        items: active.filter((x) => x.category === p.category),
        href: p.category === "internet" ? "/internet" : p.category === "mobile_pack" ? "/mobile-pack" : "/topup",
      });
    } else {
      tiles.push({ key: p.id, name: p.name, category: p.category, icon: categoryIcon[p.category] || Zap, items: [p], href: `/services/${p.id}` });
    }
  }

  return (
    <div>
      <div className="mb-8">
        {firstName ? (
          <p className="text-sm font-medium text-ink-3">Welcome back, {firstName}</p>
        ) : null}
        <h1 className="font-display text-2xl text-ink sm:text-3xl">What would you like to pay?</h1>
        <p className="mt-1.5 text-sm text-ink-3">
          Choose a product, enter the details, and pay securely with your card.
        </p>
      </div>

      {tiles.length === 0 && <p className="mt-8 text-sm text-ink-3">No products are available right now.</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => router.push(t.href)}
              className="group flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-moss/40 hover:shadow-lg hover:shadow-moss/5 active:scale-[0.98]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-moss/10 text-moss transition-colors group-hover:bg-moss/15">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-ink">{t.name}</h3>
                <p className="mt-0.5 line-clamp-2 text-xs capitalize text-ink-3">
                  {t.items.length > 1
                    ? t.items.map((i: any) => i.name).join(" · ")
                    : t.category}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-ink-3 transition-all group-hover:translate-x-1 group-hover:text-moss" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
