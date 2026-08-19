"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  useAdminProducts,
  useCreateAdminProduct,
  useUpdateAdminProduct,
  useDeleteAdminProduct,
} from "@/hooks/admin/useAdminProducts";
import { useAdminGateways } from "@/hooks/admin/useAdminGateways";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import type { Product } from "@/types";

export default function AdminProductsPage() {
  const { data: products, isLoading } = useAdminProducts();
  const { data: gateways } = useAdminGateways();
  const createProduct = useCreateAdminProduct();
  const updateProduct = useUpdateAdminProduct();
  const deleteProduct = useDeleteAdminProduct();

  const [editing, setEditing] = useState<Product | null | undefined>(undefined);

  const rows = products ?? [];
  const gatewayName = (id: string | null) =>
    (id && gateways?.find((g) => g.id === id)?.name) || "—";

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Product",
      mobile: "primary",
      render: (p) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{p.name}</p>
          <p className="truncate text-xs capitalize text-ink-3">{p.category}</p>
        </div>
      ),
    },
    {
      key: "code",
      header: "Code",
      mobile: "hide",
      render: (p) =>
        p.product_code ? (
          <span className="rounded bg-ink/[0.06] px-2 py-1 font-mono text-xs text-ink-2">{p.product_code}</span>
        ) : (
          "—"
        ),
    },
    {
      key: "gateway",
      header: "Gateway",
      mobile: "hide",
      render: (p) => <span className="text-ink-3">{gatewayName(p.gateway_id)}</span>,
    },
    {
      key: "limits",
      header: "Min / Max",
      mobile: "hide",
      render: (p) => (
        <span className="text-ink-3">
          {p.min_amount > 0 ? p.min_amount : "0"} / {p.max_amount > 0 ? p.max_amount : "∞"}
        </span>
      ),
    },
    {
      key: "fees",
      header: "Fees",
      mobile: "hide",
      render: (p) =>
        p.service_charge > 0 || p.bank_processing_fee > 0 ? (
          <span className="text-ink-3">
            {p.service_charge || 0}% / {p.bank_processing_fee || 0}%
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) =>
        p.is_active ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Hidden</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (p) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setEditing(p)}>
            Edit
          </Button>
          <Button
            variant="secondary"
            className="px-3 py-1.5 text-xs"
            onClick={() => updateProduct.mutate({ id: p.id, is_active: !p.is_active })}
          >
            {p.is_active ? "Hide" : "Show"}
          </Button>
          <Button
            variant="ghost"
            className="px-3 py-1.5 text-xs text-danger hover:bg-red-50"
            onClick={() => {
              if (confirm(`Delete "${p.name}"? This can't be undone.`)) {
                deleteProduct.mutate(p.id);
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Bill-payment products users can pick — NTC, Ncell, NEA, and more."
        actions={
          <Button onClick={() => setEditing(null)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            New product
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        emptyMessage="No products yet. Add your first one."
      />

      {editing !== undefined && (
        <ProductFormModal
          product={editing}
          gateways={gateways || []}
          onClose={() => setEditing(undefined)}
          onSubmit={(input) =>
            editing ? updateProduct.mutateAsync({ id: editing.id, ...input }) : createProduct.mutateAsync(input)
          }
        />
      )}
    </div>
  );
}
