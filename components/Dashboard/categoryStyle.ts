import { Smartphone, Wifi, Package, Droplets, Mountain, Zap, type LucideIcon } from "lucide-react";

export interface CategoryMeta {
  label: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  accent: string;
  soft: string;
  ring: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  mobile_topup: {
    label: "Mobile Top Up",
    description: "Recharge any Nepali number instantly",
    icon: Smartphone,
    gradient: "bg-gradient-to-br from-sky-500 to-indigo-600",
    accent: "text-sky-600",
    soft: "bg-sky-50",
    ring: "hover:ring-sky-200",
  },
  internet: {
    label: "Internet & Data",
    description: "Pay broadband & fiber bills",
    icon: Wifi,
    gradient: "bg-gradient-to-br from-violet-500 to-purple-600",
    accent: "text-violet-600",
    soft: "bg-violet-50",
    ring: "hover:ring-violet-200",
  },
  mobile_pack: {
    label: "Mobile Packs",
    description: "Data, voice & combo packs",
    icon: Package,
    gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
    accent: "text-emerald-600",
    soft: "bg-emerald-50",
    ring: "hover:ring-emerald-200",
  },
  utility: {
    label: "Utilities",
    description: "Electricity, water & more",
    icon: Droplets,
    gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
    accent: "text-amber-600",
    soft: "bg-amber-50",
    ring: "hover:ring-amber-200",
  },
  transport: {
    label: "Transport",
    description: "Travel & transit top ups",
    icon: Mountain,
    gradient: "bg-gradient-to-br from-rose-500 to-pink-600",
    accent: "text-rose-600",
    soft: "bg-rose-50",
    ring: "hover:ring-rose-200",
  },
};

export function categoryMeta(category: string): CategoryMeta {
  return (
    CATEGORY_META[category] ?? {
      label: category,
      description: "Pay quickly & securely",
      icon: Zap,
      gradient: "bg-gradient-to-br from-moss to-moss2",
      accent: "text-moss",
      soft: "bg-red-50",
      ring: "hover:ring-red-200",
    }
  );
}
