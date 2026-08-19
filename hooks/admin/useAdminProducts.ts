"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { ApiSuccess, Product } from "@/types";

export function useAdminProducts() {
  return useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Product[]>>("/api/v1/admin/products");
      return res.data.data;
    },
  });
}

export interface ProductInput {
  name: string;
  category: string;
  product_code: string;
  gateway_id?: string | null;
  phone_prefixes?: string;
  min_amount?: number;
  max_amount?: number;
  service_charge?: number;
  bank_processing_fee?: number;
  display_order?: number;
  icon_url?: string;
  is_active?: boolean;
}

export function useCreateAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProductInput) => {
      const res = await apiClient.post("/api/v1/admin/products", input);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

export function useUpdateAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<ProductInput> & { id: string }) => {
      const res = await apiClient.patch(`/api/v1/admin/products/${id}`, input);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

export function useDeleteAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/admin/products/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}
