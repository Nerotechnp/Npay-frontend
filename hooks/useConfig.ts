"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { ApiSuccess, AppConfig } from "@/types";

// App-wide settings sourced from the backend (exchange rate, supported
// currencies) so the client never hardcodes or tampers with them.
export function useConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<AppConfig>>("/api/v1/config");
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
