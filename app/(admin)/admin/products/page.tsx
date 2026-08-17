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
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import type { Product } from "@/types";

export default function AdminProductsPage() {
  const { data: products, isLoading } = useAdminProducts();
  const { data: gateways } = useAdminGateways();
  const createProduct = useCreateAdminProduct();
  const updateProduct = useUpdateAdminProduct();
  const deleteProduct = useDeleteAdminProduct();

  const [editing, setEditing] = useState<Product | null | undefined>(undefined);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink-3">
            Bill-payment products users can pick — NTC, Ncell, NEA, and more. Manage gateway, limits, and visibility here.
          </p>
        </div>
        <Button onClick={() => setEditing(null)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          New product
        </Button>
      </div>

      <Card className="mt-6 overflow-x-auto rounded-2xl p-0">
        <table className="admin-table w-full text-left text-sm">
          <thead className="border-b border-line text-xs text-ink-3">
            <tr>
              <th className="bg-paper px-5 py-3 font-medium">Product</th>
              <th className="bg-paper px-5 py-3 font-medium">Category</th>
              <th className="bg-paper px-5 py-3 font-medium">Product code</th>
              <th className="bg-paper px-5 py-3 font-medium">Gateway</th>
              <th className="bg-paper px-5 py-3 font-medium">Min / Max (NPR)</th>
              <th className="bg-paper px-5 py-3 font-medium">Status</th>
              <th className="bg-paper px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-ink-3">
                  Loading…
                </td>
              </tr>
            )}
            {products?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-ink-3">
                  No products yet. Add your first one.
                </td>
              </tr>
            )}
            {products?.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3 font-medium text-ink">{p.name}</td>
                <td className="px-5 py-3 capitalize text-ink-3">{p.category}</td>
                <td className="px-5 py-3">
                  {p.product_code ? (
                    <span className="rounded bg-ink/[0.06] px-2 py-1 font-mono text-xs text-ink-2">
                      {p.product_code}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-5 py-3 text-ink-3">
                  {gateways?.find((g) => g.id === p.gateway_id)?.name || "—"}
                </td>
                <td className="px-5 py-3 text-ink-3">
                  {p.min_amount > 0 ? p.min_amount : "0"} / {p.max_amount > 0 ? p.max_amount : "∞"}
                </td>
                <td className="px-5 py-3">
                  {p.is_active ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Hidden</Badge>}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

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
