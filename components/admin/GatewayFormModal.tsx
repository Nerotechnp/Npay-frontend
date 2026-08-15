"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Gateway } from "@/types";
import type { GatewayInput } from "@/hooks/admin/useAdminGateways";
import { useProviderCodes } from "@/hooks/admin/useAdminGateways";

interface GatewayFormModalProps {
  gateway?: Gateway | null;
  onClose: () => void;
  onSubmit: (input: GatewayInput) => Promise<unknown>;
}

export function GatewayFormModal({ gateway, onClose, onSubmit }: GatewayFormModalProps) {
  const isEdit = !!gateway;
  const { data: providerCodes } = useProviderCodes();
  const [name, setName] = useState(gateway?.name || "");
  const [providerCode, setProviderCode] = useState(gateway?.provider_code || providerCodes?.[0] || "");
  const [baseUrl, setBaseUrl] = useState(gateway?.base_url || "");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [isActive, setIsActive] = useState(gateway?.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Default a brand-new gateway's provider_code to the first available integration
  // once the list loads (edit mode keeps the gateway's existing code, locked).
  useEffect(() => {
    if (!isEdit && !providerCode && providerCodes?.length) {
      setProviderCode(providerCodes[0]);
    }
  }, [isEdit, providerCode, providerCodes]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const input: GatewayInput = {
        name,
        provider_code: providerCode,
        base_url: baseUrl,
        is_active: isActive,
      };
      // Only send credential fields if the admin actually typed something —
      // leaving them blank keeps whatever is already stored untouched.
      if (apiKey) input.api_key = apiKey;
      if (apiSecret) input.api_secret = apiSecret;

      await onSubmit(input);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Couldn't save this gateway.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={gateway ? "Edit gateway" : "New gateway"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />

        <Select
          label="Provider code"
          value={providerCode}
          onChange={(e) => setProviderCode(e.target.value)}
          disabled={isEdit}
        >
          {(providerCodes || []).map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </Select>

        <Input
          label="Base URL (optional)"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://api.provider.com"
        />

        <Input
          label={gateway?.has_credentials ? "API key (leave blank to keep current)" : "API key"}
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          autoComplete="off"
        />

        <Input
          label={gateway?.has_credentials ? "API secret (leave blank to keep current)" : "API secret"}
          type="password"
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
          autoComplete="off"
        />

        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active
        </label>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {gateway ? "Save changes" : "Create gateway"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
