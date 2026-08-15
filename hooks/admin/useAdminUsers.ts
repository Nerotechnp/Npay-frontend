"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { ApiSuccess, PaginatedUsers } from "@/types";

export function useAdminUsers(search: string, offset: number) {
  return useQuery({
    queryKey: ["admin", "users", search, offset],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<PaginatedUsers>>("/api/v1/admin/users", {
        params: { search: search || undefined, offset, limit: 20 },
      });
      return res.data.data;
    },
  });
}

interface UpdateUserInput {
  id: string;
  is_blocked?: boolean;
  is_admin?: boolean;
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: UpdateUserInput) => {
      const res = await apiClient.patch(`/api/v1/admin/users/${id}`, body);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
