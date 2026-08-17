"use client";

import { useEffect } from "react";
import apiClient from "@/lib/api-client";
import { getAccessToken, clearTokens } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
import type { ApiSuccess, User } from "@/types";

export function useAuth() {
  const { user, isLoading, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    // Skip bootstrap if we already have a user. This matters because useAuth()
    // is called by both the admin layout and its child pages. Without the
    // guard, a child page would call setLoading(true) on mount, which makes the
    // layout (which gates children behind isLoading) unmount and remount the
    // page forever — an infinite loading loop on e.g. /admin/users.
    if (user) return;

    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
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
  }, [user, setUser, setLoading]);

  return { user, isLoading, logout };
}
