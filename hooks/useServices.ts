"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { ApiSuccess, Product } from "@/types";

// The user-facing catalog is now backed by the Products API. Hook names are kept
// for minimal churn in the dashboard, but they return Product objects.
export function useServices() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Product[]>>("/api/v1/products");
      return res.data.data;
    },
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Product>>(`/api/v1/products/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

// Server-side carrier detection: given a phone number, the backend resolves the
// matching mobile_topup product from admin-managed prefixes.
export function useDetectProduct() {
  return useMutation({
    mutationFn: async (phone: string) => {
      const res = await apiClient.post<ApiSuccess<Product>>("/api/v1/products/detect", { phone });
      return res.data.data;
    },
  });
}
