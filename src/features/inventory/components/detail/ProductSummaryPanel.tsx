"use client";

import type { ReactNode } from "react";

import { DetailPageAsidePanelSection } from "@/features/app-shell/components/page-layout";
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

function SummaryField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-brand-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-semibold text-brand-navy">
        {value}
      </dd>
    </div>
  );
}

export function ProductSummaryPanel({
  product,
  className,
}: ProductSummaryPanelProps) {
  const meta = getProductMeta(product);
  const uomLabel = Array.isArray(product.uom_id) ? product.uom_id[1] : "—";
  const createdBy =
    meta.created_by_name?.trim() ||
    (meta.created_by ? `User #${meta.created_by}` : "—");

  return (
    <DetailPageAsidePanelSection className={cn(className)}>
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase text-brand-muted">
          Product summary
        </h3>
        <dl className="space-y-3">
          <SummaryField label="Type" value={formatProductTypeLabel(product)} />
          <SummaryField label="Internal code" value={product.default_code ?? "—"} />
          <SummaryField label="Barcode" value={product.barcode ?? "—"} />
          <SummaryField label="Unit of measure" value={uomLabel} />
          <SummaryField
            label="Status"
            value={product.active ? "Active" : "Inactive"}
          />
          <SummaryField
            label="Can be sold"
            value={formatBooleanLabel(product.sale_ok)}
          />
          <SummaryField
            label="Can be purchased"
            value={formatBooleanLabel(product.purchase_ok)}
          />
          <SummaryField label="Created by" value={createdBy} />
        </dl>
      </div>
    </DetailPageAsidePanelSection>
  );
}
