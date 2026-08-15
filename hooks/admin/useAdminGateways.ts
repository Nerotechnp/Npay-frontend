"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { ApiSuccess, Gateway } from "@/types";

export function useAdminGateways() {
  return useQuery({
    queryKey: ["admin", "gateways"],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Gateway[]>>("/api/v1/admin/gateways");
      return res.data.data;
    },
  });
}

// useProviderCodes fetches the delivery-integration provider_codes compiled into
// the backend (e.g. "khalti", "esewa"). The admin gateway form renders these as
// a fixed dropdown so an admin can't free-type a code with no integration.
export function useProviderCodes() {
  return useQuery({
    queryKey: ["admin", "provider-codes"],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<string[]>>("/api/v1/admin/gateways/provider-codes");
      return res.data.data;
    },
  });
}

export interface GatewayInput {
  name: string;
  provider_code: string;
  base_url?: string;
  api_key?: string;
  api_secret?: string;
  config?: string;
  is_active?: boolean;
}

export function useCreateAdminGateway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: GatewayInput) => {
      const res = await apiClient.post("/api/v1/admin/gateways", input);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "gateways"] }),
  });
}

export function useUpdateAdminGateway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<GatewayInput> & { id: string }) => {
      const res = await apiClient.patch(`/api/v1/admin/gateways/${id}`, input);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "gateways"] }),
  });
}

export function useDeleteAdminGateway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/admin/gateways/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "gateways"] }),
  });
}
