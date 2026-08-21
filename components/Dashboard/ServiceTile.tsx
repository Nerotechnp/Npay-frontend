"use client";

import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { categoryMeta } from "./categoryStyle";

export interface Tile {
  key: string;
  category: string;
  name: string;
  description?: string;
  href: string;
  count?: number;
}

export function ServiceTile({ tile }: { tile: Tile }) {
  const router = useRouter();
  const meta = categoryMeta(tile.category);
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={() => router.push(tile.href)}
      className={`group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/5 ${meta.ring} ring-1 ring-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-moss/40`}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/0 to-white/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div
        className={`relative flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${meta.gradient}`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="relative flex-1">
        <h3 className="text-[15px] font-semibold text-ink">{tile.name}</h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink-3">
          {tile.description ?? meta.description}
        </p>
      </div>
      <div className="relative flex items-center justify-between">
        {tile.count ? (
          <span className={`text-[11px] font-medium ${meta.accent}`}>{tile.count} options</span>
        ) : (
          <span />
        )}
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full ${meta.soft} transition-transform duration-300 group-hover:translate-x-0.5`}
        >
          <ArrowUpRight className={`h-4 w-4 ${meta.accent}`} />
        </span>
      </div>
    </button>
  );
}
