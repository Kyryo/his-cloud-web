"use client";

import {
  DetailPageAsidePanelSection,
  DetailPageAsideSummaryField,
  DetailPageAsideSummarySection,
} from "@/features/app-shell/components/page-layout";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import {
  formatBooleanLabel,
  formatProductTypeLabel,
  getProductMeta,
} from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

type ProductSummaryPanelProps = {
  product: InventoryProduct;
  className?: string;
};

export function ProductSummaryPanel({
  product,
  className,
}: ProductSummaryPanelProps) {
  const meta = getProductMeta(product);
  const uomLabel = product.uom_name?.trim() || "—";
  const createdBy =
    meta.created_by_name?.trim() ||
    (meta.created_by ? `User #${meta.created_by}` : "—");

  return (
    <DetailPageAsidePanelSection className={cn(className)}>
      <DetailPageAsideSummarySection title="Product summary" className="border-t-0 pt-0">
        <DetailPageAsideSummaryField
          label="Type"
          value={formatProductTypeLabel(product)}
        />
        <DetailPageAsideSummaryField
          label="Internal code"
          value={product.default_code || "—"}
        />
        <DetailPageAsideSummaryField label="Barcode" value={product.barcode || "—"} />
        <DetailPageAsideSummaryField label="Unit of measure" value={uomLabel} />
        <DetailPageAsideSummaryField
          label="Status"
          value={product.is_active ? "Active" : "Inactive"}
        />
        <DetailPageAsideSummaryField
          label="Can be sold"
          value={formatBooleanLabel(product.sale_ok)}
        />
        <DetailPageAsideSummaryField
          label="Can be purchased"
          value={formatBooleanLabel(product.purchase_ok)}
        />
        <DetailPageAsideSummaryField label="Created by" value={createdBy} />
      </DetailPageAsideSummarySection>
    </DetailPageAsidePanelSection>
  );
}
