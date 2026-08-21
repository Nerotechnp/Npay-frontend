"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { ApiSuccess, MobilePack } from "@/types";

// usePacks loads the real, gateway-sourced pack catalog for a mobile_pack
// product. The catalog lives in the delivery gateway's Config JSON (admin
// managed), so it reflects what the gateway can actually provision — no
// client-side hardcoding. Disabled until a product is selected.
export function usePacks(productId: string | null) {
  return useQuery({
    queryKey: ["products", productId, "packs"],
    enabled: !!productId,
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<MobilePack[]>>(
        `/api/v1/products/${productId}/packs`
      );
      return res.data.data;
    },
  });
}
