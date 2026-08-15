"use client";

import { Smartphone, Zap, Droplets, Mountain, Package, Wifi } from "lucide-react";
import { useServices } from "@/hooks/useServices";
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

export default function DashboardPage() {
  const { data: products, isLoading, isError } = useServices();
  const router = useRouter();

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl text-ink">What would you like to pay?</h1>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-line" />
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
      <h1 className="font-display text-2xl text-ink">What would you like to pay?</h1>
      <p className="mt-1 text-sm text-ink-3">Choose a product, enter the details, and pay securely with your card.</p>

      {tiles.length === 0 && <p className="mt-8 text-sm text-ink-3">No products are available right now.</p>}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => router.push(t.href)}
              className="group flex flex-col gap-3 rounded-xl border border-line bg-white p-5 text-left shadow-sm transition-all hover:border-moss"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">{t.name}</h3>
                <p className="mt-0.5 text-xs capitalize text-ink-3">
                  {t.items.length > 1
                    ? t.items.map((i: any) => i.name).join(" · ")
                    : t.category}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

