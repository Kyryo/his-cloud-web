"use client";

import {
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { InventorySummaryPanel } from "@/features/inventory/components/InventorySummaryPanel";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatInventoryAmount } from "@/features/inventory/utils/format-inventory";

type ProductDetailTabsProps = {
  product: InventoryProduct;
};

export function ProductDetailTabs({ product }: ProductDetailTabsProps) {
  const uomLabel = Array.isArray(product.uom_id) ? product.uom_id[1] : "—";

  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Product sections">
        <DetailPageTabNavItem isActive onClick={() => undefined}>
          Summary
        </DetailPageTabNavItem>
      </DetailPageTabsNavSection>

      <DetailPageMainSection>
        <InventorySummaryPanel
          sections={[
            {
              title: "Product details",
              fields: [
                { label: "Name", value: product.display_name || product.name },
                { label: "Internal code", value: product.default_code ?? "—" },
                { label: "Barcode", value: product.barcode ?? "—" },
                { label: "List price", value: formatInventoryAmount(product.list_price) },
                {
                  label: "Standard price",
                  value: formatInventoryAmount(product.standard_price),
                },
                { label: "Unit of measure", value: uomLabel },
                { label: "Status", value: product.active ? "Active" : "Inactive" },
              ],
            },
          ]}
        />
      </DetailPageMainSection>
    </DetailPageTabsSection>
  );
}
