"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { ApiSuccess, DashboardStats } from "@/types";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<DashboardStats>>("/api/v1/admin/dashboard/stats");
      return res.data.data;
    },
  });
}
