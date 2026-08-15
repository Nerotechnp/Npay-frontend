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
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-2xl text-ink">Profile</h1>
      <p className="mt-1 text-sm text-ink-3">{user.email}</p>

      <Card className="mt-6">
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
          {error && <p className="text-xs text-danger">{error}</p>}
          {saved && <p className="text-xs text-moss">Saved.</p>}
          <Button type="submit" loading={loading} className="w-full">
            Save changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
