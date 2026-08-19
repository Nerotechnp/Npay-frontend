"use client";

import { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  /** How this column behaves on the mobile card layout. */
  mobile?: "primary" | "field" | "hide";
  /** On mobile, span the full width of the card instead of half. */
  span?: boolean;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  loadingRows?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

const alignClass: Record<NonNullable<Column<unknown>["align"]>, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  loadingRows = 6,
  emptyMessage = "Nothing to show yet.",
  onRowClick,
}: DataTableProps<T>) {
  const primary = columns.find((c) => c.mobile === "primary");
  const actions = columns.find((c) => c.align === "right");
  const fields = columns.filter(
    (c) => c !== primary && c !== actions && c.mobile !== "hide"
  );

  return (
    <>
      {/* Desktop: classic table */}
      <div className="hidden overflow-hidden rounded-2xl border border-line bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="admin-table w-full text-left text-sm">
            <thead className="border-b border-line bg-paper text-xs font-medium uppercase tracking-wide text-ink-3">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={`px-4 py-3 ${alignClass[c.align ?? "left"]} ${c.headerClassName ?? ""}`}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {isLoading ? (
                Array.from({ length: loadingRows }).map((_, i) => (
                  <tr key={`sk-${i}`} className="animate-pulse">
                    {columns.map((c) => (
                      <td key={c.key} className={`px-4 py-3 ${alignClass[c.align ?? "left"]}`}>
                        <div className="h-4 w-24 rounded bg-line" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-ink-3">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`transition-colors hover:bg-paper ${onRowClick ? "cursor-pointer" : ""}`}
                  >
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={`px-4 py-3 align-middle ${alignClass[c.align ?? "left"]} ${c.cellClassName ?? ""}`}
                      >
                        {c.render(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: card list */}
      <div className="space-y-3 md:hidden">
        {isLoading ? (
          Array.from({ length: loadingRows }).map((_, i) => (
            <div key={`msk-${i}`} className="h-32 animate-pulse rounded-2xl border border-line bg-white" />
          ))
        ) : data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line py-14 text-center text-sm text-ink-3">
            {emptyMessage}
          </div>
        ) : (
          data.map((row) => (
            <div key={rowKey(row)} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
              {primary && <div className="mb-3">{primary.render(row)}</div>}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {fields.map((c) => (
                  <div key={c.key} className={c.span ? "col-span-2" : ""}>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
                      {c.header}
                    </dt>
                    <dd className="mt-0.5 text-sm text-ink">{c.render(row)}</dd>
                  </div>
                ))}
              </dl>
              {actions && (
                <div className="mt-3 border-t border-line pt-3">{actions.render(row)}</div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
