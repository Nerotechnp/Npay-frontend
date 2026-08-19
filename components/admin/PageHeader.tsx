import { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        {badge && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-moss/10 px-2.5 py-0.5 text-xs font-medium text-moss">
            {badge}
          </span>
        )}
        <h1
          className={`${badge ? "mt-2" : ""} font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl`}
        >
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-ink-3">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
