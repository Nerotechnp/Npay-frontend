"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function ProfilePage() {
  const { user } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [country, setCountry] = useState(user?.country || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setLoading(true);
    try {
      const res = await apiClient.patch("/api/v1/user/profile", {
        full_name: fullName,
        country,
      });
      setUser(res.data.data);
      setSaved(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Couldn't save changes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Your profile</h1>
          <p className="mt-2 text-sm text-ink-3">{user.email}</p>
          <span
            className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              user.is_admin
                ? "bg-moss/10 text-moss"
                : "bg-saffron/10 text-saffron"
            }`}
          >
            {user.is_admin ? "Administrator" : "Member"}
          </span>
        </div>

        <Card className="p-6 shadow-md shadow-moss/5 sm:p-7">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input
              label="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
            <Input
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Australia"
            />
            {error && (
              <div className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-xs text-danger">
                {error}
              </div>
            )}
            {saved && (
              <div className="rounded-lg border border-moss/20 bg-moss/5 px-3 py-2 text-xs text-moss">
                Changes saved.
              </div>
            )}
            <Button type="submit" loading={loading} className="mt-1 w-full py-3 text-base">
              Save changes
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
