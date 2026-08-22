"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Product, Gateway, ProductCategory } from "@/types";
import type { ProductInput } from "@/hooks/admin/useAdminProducts";
import { useProductCategories } from "@/hooks/useServices";

const percentInput = (value: number) => (value ? String(value) : "");

// Fallback so the form still works if the categories endpoint is unreachable.
// The live list is fetched from the backend (GET /api/v1/products/categories).
const FALLBACK_CATEGORIES: ProductCategory[] = [
  { category: "mobile_topup", label: "Mobile Topup", product_codes: ["ntc_topup", "ncell_topup"] },
  { category: "mobile_pack", label: "Mobile Pack", product_codes: ["ntc_data", "ncell_data"] },
  { category: "internet", label: "Internet", product_codes: ["internet"] },
  { category: "utility", label: "Utility", product_codes: ["nea_electricity"] },
  { category: "transport", label: "Transport", product_codes: ["transport"] },
];

interface ProductFormModalProps {
  product?: Product | null;
  gateways: Gateway[];
  onClose: () => void;
  onSubmit: (input: ProductInput) => Promise<unknown>;
}

export function ProductFormModal({ product, gateways, onClose, onSubmit }: ProductFormModalProps) {
  const { data: categoryData } = useProductCategories();
  const categories = categoryData ?? FALLBACK_CATEGORIES;

  const [name, setName] = useState(product?.name || "");
  const [category, setCategory] = useState(product?.category || "mobile_topup");
  const [productCode, setProductCode] = useState(
    product?.product_code || categories.find((c) => c.category === (product?.category || "mobile_topup"))?.product_codes[0] || ""
  );

  // When the category changes, switch the product code to a valid option for the
  // new category (keep it only if it's still offered by the new category).
  function handleCategoryChange(value: string) {
    setCategory(value);
    const codes = categories.find((c) => c.category === value)?.product_codes ?? [];
    if (!codes.includes(productCode)) {
      setProductCode(codes[0] ?? "");
    }
  }

  const productCodeOptions = categories.find((c) => c.category === category)?.product_codes ?? [];
  const [gatewayId, setGatewayId] = useState(product?.gateway_id || "");
  const [phonePrefixes, setPhonePrefixes] = useState(product?.phone_prefixes || "");
  const [minAmount, setMinAmount] = useState(product?.min_amount ?? 0);
  const [maxAmount, setMaxAmount] = useState(product?.max_amount ?? 0);
  const [serviceCharge, setServiceCharge] = useState(product?.service_charge ?? 0);
  const [bankProcessingFee, setBankProcessingFee] = useState(product?.bank_processing_fee ?? 0);
  const [iconUrl, setIconUrl] = useState(product?.icon_url || "");
  const [displayOrder, setDisplayOrder] = useState(product?.display_order ?? 0);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        name,
        category,
        product_code: productCode,
        gateway_id: gatewayId || null,
        phone_prefixes: phonePrefixes,
        min_amount: minAmount,
        max_amount: maxAmount,
        service_charge: serviceCharge,
        bank_processing_fee: bankProcessingFee,
        display_order: displayOrder,
        icon_url: iconUrl,
        is_active: isActive,
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Couldn't save this product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={product ? "Edit product" : "New product"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />

        <Select label="Category" value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
          {categories.map((c) => (
            <option key={c.category} value={c.category}>
              {c.label}
            </option>
          ))}
        </Select>

        <Select label="Product code" value={productCode} onChange={(e) => setProductCode(e.target.value)} required>
          {productCodeOptions.length === 0 ? (
            <option value="">— None —</option>
          ) : (
            productCodeOptions.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))
          )}
        </Select>

        <Select label="Gateway (optional)" value={gatewayId} onChange={(e) => setGatewayId(e.target.value)}>
          <option value="">— None —</option>
          {gateways.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name} ({g.provider_code})
            </option>
          ))}
        </Select>

        {category === "mobile_topup" && (
          <Input
            label="Phone prefixes (comma-separated, for auto-detect)"
            value={phonePrefixes}
            onChange={(e) => setPhonePrefixes(e.target.value)}
            placeholder="e.g. 984,985,986"
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Min amount (NPR)"
            type="number"
            min={0}
            step="0.01"
            value={minAmount}
            onChange={(e) => setMinAmount(parseFloat(e.target.value) || 0)}
          />
          <Input
            label="Max amount (NPR)"
            type="number"
            min={0}
            step="0.01"
            value={maxAmount}
            onChange={(e) => setMaxAmount(parseFloat(e.target.value) || 0)}
            placeholder="0 = no limit"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Service charge (%)"
            type="number"
            min={0}
            step="0.01"
            value={percentInput(serviceCharge)}
            onChange={(e) => setServiceCharge(parseFloat(e.target.value) || 0)}
            placeholder="e.g. 1.5"
          />
          <Input
            label="Bank processing fee (%)"
            type="number"
            min={0}
            step="0.01"
            value={percentInput(bankProcessingFee)}
            onChange={(e) => setBankProcessingFee(parseFloat(e.target.value) || 0)}
            placeholder="e.g. 2"
          />
        </div>

        <Input
          label="Icon URL (optional)"
          value={iconUrl}
          onChange={(e) => setIconUrl(e.target.value)}
        />

        <Input
          label="Display order (optional)"
          type="number"
          min={0}
          step="1"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
          placeholder="0 = default order"
        />

        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active (visible to users)
        </label>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {product ? "Save changes" : "Create product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
