"use client";

import { useMemo } from "react";

import { InventoryProductPicker } from "@/features/inventory/components/InventoryProductPicker";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import type { LabProductBrief } from "@/features/laboratory/types/laboratory-catalog.types";

type LabCatalogProductFieldProps = {
  productUuid: string;
  productBrief?: LabProductBrief | null;
  onChange: (productUuid: string, product: InventoryProduct | null) => void;
  disabled?: boolean;
  invalid?: boolean;
  label?: string;
  id?: string;
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
  };
}

export function LabCatalogProductField({
  productUuid,
  productBrief = null,
  onChange,
  disabled = false,
  invalid = false,
  label = "Billing product",
  id = "lab-catalog-product",
}: LabCatalogProductFieldProps) {
  const selected = useMemo(() => {
    if (productBrief && productBrief.uuid === productUuid) {
      return briefToProduct(productBrief);
    }
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
  }, [productBrief, productUuid]);

  return (
    <div data-testid="lab-catalog-product-field">
      <InventoryProductPicker
        id={id}
        label={label}
        product={selected}
        disabled={disabled}
        invalid={invalid}
        helperText="Search active products by name or SKU (prefer lab-test / service products)."
        onProductChange={(product) => {
          if (!product) {
            onChange("", null);
            return;
          }
          onChange(product.uuid, product);
        }}
      />
    </div>
  );
}
