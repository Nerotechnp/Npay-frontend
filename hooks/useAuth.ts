"use client";

import { useEffect } from "react";
import apiClient from "@/lib/api-client";
import { getAccessToken, clearTokens } from "@/lib/auth";
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
      .catch(() => {
        // Token is invalid/expired OR the backend is unreachable. Clear it so the
        // app falls back to the login page instead of bouncing between
        // /dashboard (no user → redirect to /login) and /login (has token →
        // redirect to /dashboard) when the API is down.
        clearTokens();
        setUser(null);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, isLoading, logout };
}
