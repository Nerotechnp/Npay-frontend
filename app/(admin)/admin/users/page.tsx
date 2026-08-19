"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useAdminUsers, useUpdateAdminUser } from "@/hooks/admin/useAdminUsers";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/types";

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = useAdminUsers(search, offset);
  const updateUser = useUpdateAdminUser();

  const users = data?.users ?? [];

  const columns: Column<User>[] = [
    {
      key: "identity",
      header: "User",
      mobile: "primary",
      render: (u) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{u.full_name || "—"}</p>
          <p className="truncate text-xs text-ink-3">{u.email}</p>
        </div>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      mobile: "hide",
      render: (u) => <span className="text-ink-3">{formatDate(u.created_at)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <div className="flex flex-wrap gap-1.5">
          {u.is_admin && <Badge tone="success">Admin</Badge>}
          {u.is_blocked ? (
            <Badge tone="danger">Blocked</Badge>
          ) : (
            <Badge tone="neutral">Active</Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (u) => {
        const isSelf = u.id === me?.id;
        return (
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              disabled={isSelf || updateUser.isPending}
              onClick={() => updateUser.mutate({ id: u.id, is_blocked: !u.is_blocked })}
            >
              {u.is_blocked ? "Unblock" : "Block"}
            </Button>
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              disabled={isSelf || updateUser.isPending}
              onClick={() => updateUser.mutate({ id: u.id, is_admin: !u.is_admin })}
            >
              {u.is_admin ? "Revoke admin" : "Make admin"}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Block accounts or grant admin access."
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3/70" />
            <Input
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOffset(0);
              }}
              className="pl-9"
            />
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={users}
        rowKey={(u) => u.id}
        isLoading={isLoading}
        emptyMessage="No users found."
      />

      {data && data.total > 20 && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink/50">
          <span>
            {offset + 1}–{Math.min(offset + 20, data.total)} of {data.total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - 20))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              disabled={offset + 20 >= data.total}
              onClick={() => setOffset(offset + 20)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
