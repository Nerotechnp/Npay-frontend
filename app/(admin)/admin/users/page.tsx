"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useAdminUsers, useUpdateAdminUser } from "@/hooks/admin/useAdminUsers";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = useAdminUsers(search, offset);
  const updateUser = useUpdateAdminUser();

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Users</h1>
      <p className="mt-1 text-sm text-ink-3">Block accounts or grant admin access.</p>

      <div className="relative mt-6 max-w-sm">
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

      <Card className="mt-4 overflow-x-auto rounded-2xl p-0">
        <table className="admin-table w-full text-left text-sm">
          <thead className="border-b border-line text-xs text-ink-3">
            <tr>
              <th className="bg-paper px-5 py-3 font-medium">Name / email</th>
              <th className="bg-paper px-5 py-3 font-medium">Joined</th>
              <th className="bg-paper px-5 py-3 font-medium">Status</th>
              <th className="bg-paper px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-ink-3">
                  Loading…
                </td>
              </tr>
            )}
            {data?.users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-ink-3">
                  No users found.
                </td>
              </tr>
            )}
            {data?.users.map((u) => {
              const isSelf = u.id === me?.id;
              return (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{u.full_name || "—"}</p>
                    <p className="text-xs text-ink-3">{u.email}</p>
                  </td>
                  <td className="px-5 py-3 text-ink-3">{formatDate(u.created_at)}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {u.is_admin && <Badge tone="success">Admin</Badge>}
                      {u.is_blocked ? <Badge tone="danger">Blocked</Badge> : <Badge tone="neutral">Active</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        className="px-3 py-1.5 text-xs"
                        disabled={isSelf || updateUser.isPending}
                        onClick={() =>
                          updateUser.mutate({ id: u.id, is_blocked: !u.is_blocked })
                        }
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

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
