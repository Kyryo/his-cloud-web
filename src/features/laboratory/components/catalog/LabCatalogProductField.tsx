"use client";

import { useEffect, useMemo, useState } from "react";

import { InventoryProductPicker } from "@/features/inventory/components/InventoryProductPicker";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { fetchUnconfiguredLabProducts } from "@/features/laboratory/services/laboratory-catalog.service";
import type { LabProductBrief } from "@/features/laboratory/types/laboratory-catalog.types";

type LabCatalogProductFieldProps = {
  productUuid: string;
  productBrief?: LabProductBrief | null;
  onChange: (productUuid: string, product: InventoryProduct | null) => void;
  disabled?: boolean;
  invalid?: boolean;
  label?: string;
  id?: string;
  /**
   * When true, search prefers unconfigured lab SKUs and warns if the selected
   * product is already bound to a test or panel.
   */
  preferUnconfigured?: boolean;
  /** Exclude this bind from the "already configured" warning (edit self). */
  allowConfiguredUuid?: string | null;
};

function briefToProduct(brief: LabProductBrief): InventoryProduct {
  return {
    uuid: brief.uuid,
    name: brief.name,
    display_name: brief.name,
    default_code: brief.default_code || null,
    barcode: null,
    list_price: null,
    standard_price: null,
    uom_name: null,
    is_active: true,
    lab_configuration: brief.lab_configuration ?? undefined,
  };
}

function isLabBillable(product: InventoryProduct): boolean {
  return Boolean(product.metadata?.is_lab_test);
}

export function LabCatalogProductField({
  productUuid,
  productBrief = null,
  onChange,
  disabled = false,
  invalid = false,
  label = "Billing product",
  id = "lab-catalog-product",
  preferUnconfigured = true,
  allowConfiguredUuid = null,
}: LabCatalogProductFieldProps) {
  const [unconfigured, setUnconfigured] = useState<InventoryProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(
    null,
  );

  useEffect(() => {
    if (!preferUnconfigured) return;
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetchUnconfiguredLabProducts({ pageSize: 100 });
        if (cancelled) return;
        setUnconfigured(
          response.results.map((row) => ({
            uuid: row.uuid,
            name: row.name,
            display_name: row.display_name || row.name,
            default_code: row.default_code || null,
            barcode: null,
            list_price: null,
            standard_price: null,
            uom_name: null,
            is_active: true,
            metadata: { is_lab_test: true },
            lab_configuration: "none",
          })),
        );
      } catch {
        if (!cancelled) setUnconfigured([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [preferUnconfigured]);

  const selected = useMemo(() => {
    if (selectedProduct && selectedProduct.uuid === productUuid) {
      return selectedProduct;
    }
    if (productBrief && productBrief.uuid === productUuid) {
      return briefToProduct(productBrief);
    }
    const fromUnconfigured = unconfigured.find((row) => row.uuid === productUuid);
    if (fromUnconfigured) return fromUnconfigured;
    if (!productUuid) return null;
    return {
      uuid: productUuid,
      name: productUuid,
      display_name: productUuid,
      default_code: null,
      barcode: null,
      list_price: null,
      standard_price: null,
      uom_name: null,
      is_active: true,
    } satisfies InventoryProduct;
  }, [productBrief, productUuid, selectedProduct, unconfigured]);

  const configuration = selected?.lab_configuration;
  const showBoundWarning =
    Boolean(productUuid) &&
    productUuid !== (allowConfiguredUuid ?? "") &&
    (configuration === "test" || configuration === "panel");

  return (
    <div className="space-y-2" data-testid="lab-catalog-product-field">
      <InventoryProductPicker
        id={id}
        label={label}
        product={selected}
        disabled={disabled}
        invalid={invalid}
        helperText={
          preferUnconfigured
            ? "Prefer unconfigured laboratory products. A product can bind to either an individual test or a panel, not both."
            : "Search active products by name or SKU (prefer laboratory / service products)."
        }
        onProductChange={(product) => {
          setSelectedProduct(product);
          if (!product) {
            onChange("", null);
            return;
          }
          onChange(product.uuid, product);
        }}
      />
      {preferUnconfigured && unconfigured.length > 0 ? (
        <div className="space-y-1" data-testid="lab-unconfigured-product-suggestions">
          <p className="text-xs font-medium text-brand-navy">
            Unconfigured laboratory products
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {unconfigured.slice(0, 8).map((row) => (
              <li key={row.uuid}>
                <button
                  type="button"
                  disabled={disabled}
                  className="rounded-md border border-brand-border bg-white px-2 py-1 text-xs text-brand-navy hover:bg-slate-50 disabled:opacity-50"
                  onClick={() => {
                    setSelectedProduct(row);
                    onChange(row.uuid, row);
                  }}
                >
                  {row.display_name || row.name}
                  {row.default_code ? ` (${row.default_code})` : ""}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {showBoundWarning ? (
        <p
          className="text-xs text-amber-800"
          data-testid="lab-catalog-product-bound-warning"
        >
          This product is already configured as{" "}
          {configuration === "panel" ? "a panel" : "an individual test"}. Binding
          it here will be rejected unless you clear the other catalog link first.
        </p>
      ) : null}
      {selected && preferUnconfigured && !isLabBillable(selected) && selected.metadata ? (
        <p className="text-xs text-brand-muted">
          Tip: mark the inventory product as a laboratory product so clinicians
          can order it from the lab picker.
        </p>
      ) : null}
    </div>
  );
}
