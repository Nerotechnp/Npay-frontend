"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { ApiSuccess, Product, ProductCategory } from "@/types";

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

// Categories that are grouped into a single dashboard tile (showing the
// available options inside) instead of one tile per product.
export const GROUPED_CATEGORIES = ["mobile_topup", "internet", "mobile_pack"];

// Maps a product category to its destination route on the dashboard.
export function hrefForCategory(category: string): string {
  if (category === "internet") return "/internet";
  if (category === "mobile_pack") return "/mobile-pack";
  if (category === "mobile_topup") return "/topup";
  return "/services";
}
// product form uses it to render the category dropdown and the dependent
// product-code dropdown, so the category -> product-code mapping lives in one
// place (the backend) rather than being hardcoded on the client. Categories are
// now returned by the product list endpoint (GET /api/v1/products?include=categories),
// so a single products call can cover both the catalog and its categories.
export function useProductCategories() {
  return useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<{ categories: ProductCategory[] }>>(
        "/api/v1/products?include=categories"
      );
      return res.data.data.categories;
    },
    staleTime: 5 * 60 * 1000,
  });
}
