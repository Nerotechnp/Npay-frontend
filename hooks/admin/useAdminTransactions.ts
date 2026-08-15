"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { ApiSuccess, PaginatedTransactions, TransactionStatus } from "@/types";

export function useAdminTransactions(status: TransactionStatus | "", offset: number) {
  return useQuery({
    queryKey: ["admin", "transactions", status, offset],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<PaginatedTransactions>>("/api/v1/admin/transactions", {
        params: { status: status || undefined, offset, limit: 20 },
      });
      return res.data.data;
    },
  });
}

export function useUpdateAdminTransactionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TransactionStatus }) => {
      const res = await apiClient.patch(`/api/v1/admin/transactions/${id}/status`, { status });
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] }),
  });
}
