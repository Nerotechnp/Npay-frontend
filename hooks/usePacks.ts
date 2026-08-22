"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { ApiSuccess, MobilePack, Product } from "@/types";

// productDetail mirrors the backend's productDetail struct: Product fields
// embedded flat at the top level plus an optional packages array.
type ProductDetail = Product & { packages?: MobilePack[] };

// usePacks loads the real, gateway-sourced pack catalog for a mobile_pack
// product. The packs are returned by the product detail endpoint
// (GET /api/v1/products/:id?include=packs) alongside the product fields.
export function usePacks(productId: string | null) {
  return useQuery({
    queryKey: ["products", productId, "packs"],
    enabled: !!productId,
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<ProductDetail>>(
        `/api/v1/products/${productId}?include=packs`
      );
      return res.data.data.packages ?? [];
    },
  });
}
