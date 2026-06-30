"use client";

import { ProductDetailFieldList } from "@/features/inventory/components/detail/ProductDetailFieldList";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import {
  formatBooleanLabel,
  formatInventoryAmount,
  formatProcedureScopeLabel,
  formatProductTypeLabel,
  getProductMeta,
} from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

type ProductDetailSummaryTabProps = {
  product: InventoryProduct;
  isActive: boolean;
};

export function ProductDetailSummaryTab({
  product,
  isActive,
}: ProductDetailSummaryTabProps) {
  const meta = getProductMeta(product);
  const uomLabel = product.uom_name?.trim() || "—";
  const createdBy =
    meta.created_by_name?.trim() ||
    (meta.created_by ? `User #${meta.created_by}` : "—");

  return (
    <div className={cn("space-y-4", !isActive && "hidden")} data-testid="product-summary-tab">
      <ProductDetailFieldList
        title="Product details"
        fields={[
          { label: "Name", value: product.display_name || product.name },
          { label: "Product ID", value: product.uuid },
          { label: "Type", value: formatProductTypeLabel(product) },
          { label: "Internal code", value: product.default_code ?? "—" },
          { label: "Barcode", value: product.barcode ?? "—" },
          { label: "Unit of measure", value: uomLabel },
          { label: "Sales price", value: formatInventoryAmount(product.list_price) },
          {
            label: "Cost",
            value: formatInventoryAmount(product.standard_price),
          },
          {
            label: "Status",
            value: product.is_active ? "Active" : "Inactive",
          },
          { label: "Created by", value: createdBy },
        ]}
      />

      <ProductDetailFieldList
        title="Classification"
        fields={[
          { label: "Drug product", value: formatBooleanLabel(meta.is_drug) },
          {
            label: "Sundry",
            value: formatBooleanLabel(meta.is_sundry),
          },
          {
            label: "Liquid or cream",
            value: formatBooleanLabel(meta.liquid_or_cream),
            hidden: !meta.is_drug,
          },
          {
            label: "Lab test",
            value: formatBooleanLabel(meta.is_lab_test),
          },
          {
            label: "Procedure",
            value: formatBooleanLabel(meta.is_procedure),
          },
          {
            label: "Procedure scope",
            value: formatProcedureScopeLabel(meta),
            hidden: !meta.is_procedure,
          },
        ]}
      />

      <ProductDetailFieldList
        title="Availability flags"
        fields={[
          {
            label: "Can be sold",
            value: formatBooleanLabel(product.sale_ok),
          },
          {
            label: "Can be purchased",
            value: formatBooleanLabel(product.purchase_ok),
          },
        ]}
      />
    </div>
  );
}
