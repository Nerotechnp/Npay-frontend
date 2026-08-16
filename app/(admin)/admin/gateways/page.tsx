"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  useAdminGateways,
  useCreateAdminGateway,
  useUpdateAdminGateway,
  useDeleteAdminGateway,
} from "@/hooks/admin/useAdminGateways";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GatewayFormModal } from "@/components/admin/GatewayFormModal";
import type { Gateway } from "@/types";

export default function AdminGatewaysPage() {
  const { data: gateways, isLoading } = useAdminGateways();
  const createGateway = useCreateAdminGateway();
  const updateGateway = useUpdateAdminGateway();
  const deleteGateway = useDeleteAdminGateway();

  const [editing, setEditing] = useState<Gateway | null | undefined>(undefined);
  const [deleteError, setDeleteError] = useState("");

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Gateways</h1>
          <p className="mt-1 text-sm text-ink-3">
            Payment processors and delivery providers — add, rotate keys, or disable, no deploy needed.
          </p>
        </div>
        <Button onClick={() => setEditing(null)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          New gateway
        </Button>
      </div>

      {deleteError && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-danger">{deleteError}</p>
      )}

      <Card className="mt-6 overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs text-ink-3">
            <tr>
              <th className="bg-paper px-5 py-3 font-medium">Gateway</th>
              <th className="bg-paper px-5 py-3 font-medium">Provider code</th>
              <th className="bg-paper px-5 py-3 font-medium">Credentials</th>
              <th className="bg-paper px-5 py-3 font-medium">Status</th>
              <th className="bg-paper px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink-3">
                  Loading…
                </td>
              </tr>
            )}
            {gateways?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink-3">
                  No gateways configured yet.
                </td>
              </tr>
            )}
            {gateways?.map((g) => (
              <tr key={g.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3 font-medium text-ink">{g.name}</td>
                <td className="px-5 py-3 text-ink-3">{g.provider_code}</td>
                <td className="px-5 py-3">
                  {g.has_credentials ? (
                    <Badge tone="success">Configured</Badge>
                  ) : (
                    <Badge tone="warning">Needs setup</Badge>
                  )}
                </td>
                <td className="px-5 py-3">
                  {g.is_active ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Disabled</Badge>}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setEditing(g)}>
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => updateGateway.mutate({ id: g.id, is_active: !g.is_active })}
                    >
                      {g.is_active ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      variant="ghost"
                      className="px-3 py-1.5 text-xs text-danger hover:bg-red-50"
                      onClick={async () => {
                        setDeleteError("");
                        if (!confirm(`Delete "${g.name}"? This can't be undone.`)) return;
                        try {
                          await deleteGateway.mutateAsync(g.id);
                        } catch (err: any) {
                          setDeleteError(err?.response?.data?.error || "Couldn't delete this gateway.");
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
        <GatewayFormModal
          gateway={editing}
          onClose={() => setEditing(undefined)}
          onSubmit={(input) =>
            editing ? updateGateway.mutateAsync({ id: editing.id, ...input }) : createGateway.mutateAsync(input)
          }
        />
      )}
    </div>
  );
}
