"use client";

import { useEffect } from "react";
import apiClient from "@/lib/api-client";
import { getAccessToken } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
import type { ApiSuccess, User } from "@/types";

export function useAuth() {
  const { user, isLoading, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    apiClient
      .get<ApiSuccess<User>>("/api/v1/user/profile")
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, isLoading, logout };
}
