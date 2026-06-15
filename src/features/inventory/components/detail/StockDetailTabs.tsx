"use client";

import {
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { InventorySummaryPanel } from "@/features/inventory/components/InventorySummaryPanel";
import type { InventoryStock } from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDateTime,
  formatInventoryAmount,
  formatInventoryQuantity,
} from "@/features/inventory/utils/format-inventory";

type StockDetailTabsProps = {
  stock: InventoryStock;
};

export function StockDetailTabs({ stock }: StockDetailTabsProps) {
  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Stock sections">
        <DetailPageTabNavItem isActive onClick={() => undefined}>
          Summary
        </DetailPageTabNavItem>
      </DetailPageTabsNavSection>

      <DetailPageMainSection>
        <InventorySummaryPanel
          highlight={
            <dl className="space-y-2.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <dt className="text-brand-muted">Qty on hand</dt>
                <dd className="font-semibold text-brand-navy">
                  {formatInventoryQuantity(stock.quantity_on_hand)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <dt className="text-brand-muted">Avg unit cost</dt>
                <dd className="font-semibold text-brand-navy">
                  {formatInventoryAmount(stock.average_unit_cost)}
                </dd>
              </div>
            </dl>
          }
          sections={[
            {
              title: "Stock details",
              fields: [
                { label: "Location", value: stock.location_name },
                { label: "Product ID", value: stock.product_id },
                { label: "Batch", value: stock.batch_number ?? "—" },
                { label: "Status", value: stock.is_active ? "Active" : "Inactive" },
                { label: "Created", value: formatDisplayDateTime(stock.created_at) },
                { label: "Updated", value: formatDisplayDateTime(stock.updated_at) },
              ],
            },
          ]}
        />
      </DetailPageMainSection>
    </DetailPageTabsSection>
  );
}
