import type { AppConfig } from "@/types";

// LiveRateBadge shows whether the displayed exchange rate comes from the live
// Nepal Rastra Bank feed or the static fallback, plus the publication date when
// live. Keeps the user informed that rates are official and current.
export function LiveRateBadge({ config }: { config?: AppConfig }) {
  const source = config?.exchange_rate_source;
  const date = config?.exchange_rate_date;

  if (source === "nrb") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-moss/10 px-2 py-0.5 text-[11px] font-medium text-moss"
        title="Rates sourced live from Nepal Rastra Bank"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-moss" />
        Live · NRB{date ? ` · ${date}` : ""}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700"
      title="Live NRB feed is currently unavailable"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Rate unavailable
    </span>
  );
}
