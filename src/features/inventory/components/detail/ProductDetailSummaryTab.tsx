"use client";

import { useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { EditProductAvailabilityDialog } from "@/features/inventory/components/detail/EditProductAvailabilityDialog";
import { EditProductClassificationDialog } from "@/features/inventory/components/detail/EditProductClassificationDialog";
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
  onProductUpdated?: (product: InventoryProduct) => void;
};

export function ProductDetailSummaryTab({
  product,
  isActive,
  onProductUpdated,
}: ProductDetailSummaryTabProps) {
  const meta = getProductMeta(product);
  const uomLabel = product.uom_name?.trim() || "—";
  const createdBy =
    meta.created_by_name?.trim() ||
    (meta.created_by ? `User #${meta.created_by}` : "—");
  const [classificationDialogOpen, setClassificationDialogOpen] = useState(false);
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);

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
        data-testid="product-classification-card"
        action={
          <SecondaryButton
            type="button"
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => setClassificationDialogOpen(true)}
            data-testid="product-classification-edit"
          >
            Edit
          </SecondaryButton>
        }
        fields={[
          { label: "Drug product", value: formatBooleanLabel(meta.is_drug) },
          {
            label: "Sundry",
            value: formatBooleanLabel(meta.is_sundry),
          },
          {
            label: "Liquid or cream",
            value: formatBooleanLabel(meta.liquid_or_cream),
            hidden: !meta.is_drug && !meta.is_sundry,
          },
          {
            label: "Lab test",
            value: formatBooleanLabel(meta.is_lab_test),
          },
          {
            label: "Radiology",
            value: formatBooleanLabel(meta.is_radiology),
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
        data-testid="product-availability-card"
        action={
          <SecondaryButton
            type="button"
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => setAvailabilityDialogOpen(true)}
            data-testid="product-availability-edit"
          >
            Edit
          </SecondaryButton>
        }
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

      <EditProductClassificationDialog
        product={product}
        open={classificationDialogOpen}
        onOpenChange={setClassificationDialogOpen}
        onUpdated={(updated) => {
          onProductUpdated?.(updated);
        }}
      />

      <EditProductAvailabilityDialog
        product={product}
        open={availabilityDialogOpen}
        onOpenChange={setAvailabilityDialogOpen}
        onUpdated={(updated) => {
          onProductUpdated?.(updated);
        }}
      />
    </div>
  );
}
