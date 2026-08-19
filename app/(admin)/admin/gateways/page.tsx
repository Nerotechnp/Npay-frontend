"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  useAdminGateways,
  useCreateAdminGateway,
  useUpdateAdminGateway,
  useDeleteAdminGateway,
} from "@/hooks/admin/useAdminGateways";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { GatewayFormModal } from "@/components/admin/GatewayFormModal";
import type { Gateway } from "@/types";

export default function AdminGatewaysPage() {
  const { data: gateways, isLoading } = useAdminGateways();
  const createGateway = useCreateAdminGateway();
  const updateGateway = useUpdateAdminGateway();
  const deleteGateway = useDeleteAdminGateway();

  const [editing, setEditing] = useState<Gateway | null | undefined>(undefined);
  const [deleteError, setDeleteError] = useState("");

  const rows = gateways ?? [];

  const columns: Column<Gateway>[] = [
    {
      key: "name",
      header: "Gateway",
      mobile: "primary",
      render: (g) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{g.name}</p>
          <p className="truncate text-xs text-ink-3">{g.provider_code}</p>
        </div>
      ),
    },
    {
      key: "creds",
      header: "Credentials",
      mobile: "hide",
      render: (g) =>
        g.has_credentials ? <Badge tone="success">Configured</Badge> : <Badge tone="warning">Needs setup</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (g) =>
        g.is_active ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Disabled</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (g) => (
        <div className="flex flex-wrap justify-end gap-2">
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
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Gateways"
        subtitle="Payment processors and delivery providers — add, rotate keys, or disable, no deploy needed."
        actions={
          <Button onClick={() => setEditing(null)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            New gateway
          </Button>
        }
      />

      {deleteError && (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-danger">{deleteError}</p>
      )}

      <DataTable
        columns={columns}
        data={rows}
        rowKey={(g) => g.id}
        isLoading={isLoading}
        emptyMessage="No gateways configured yet."
      />

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
