"use client";

import {
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { InventorySummaryPanel } from "@/features/inventory/components/InventorySummaryPanel";
import type { InventoryMovement } from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDateTime,
  formatInventoryAmount,
  formatInventoryQuantity,
  formatMovementTypeLabel,
} from "@/features/inventory/utils/format-inventory";

type MovementDetailTabsProps = {
  movement: InventoryMovement;
};

export function MovementDetailTabs({ movement }: MovementDetailTabsProps) {
  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Movement sections">
        <DetailPageTabNavItem isActive onClick={() => undefined}>
          Summary
        </DetailPageTabNavItem>
      </DetailPageTabsNavSection>

      <DetailPageMainSection>
        <InventorySummaryPanel
          highlight={
            <dl className="space-y-2.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <dt className="text-brand-muted">Quantity</dt>
                <dd className="font-semibold text-brand-navy">
                  {formatInventoryQuantity(movement.quantity)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <dt className="text-brand-muted">Total cost</dt>
                <dd className="font-semibold text-brand-navy">
                  {formatInventoryAmount(movement.total_cost)}
                </dd>
              </div>
            </dl>
          }
          sections={[
            {
              title: "Movement details",
              fields: [
                {
                  label: "Type",
                  value: formatMovementTypeLabel(movement.movement_type),
                },
                { label: "Product ID", value: movement.odoo_product_id },
                { label: "Batch", value: movement.batch_number ?? "—" },
                {
                  label: "From location",
                  value: movement.from_location_name ?? "—",
                },
                { label: "To location", value: movement.to_location_name ?? "—" },
                {
                  label: "Unit cost",
                  value: formatInventoryAmount(movement.unit_cost),
                },
                { label: "Reference", value: movement.reference_model ?? "—" },
                { label: "Created", value: formatDisplayDateTime(movement.created_at) },
                {
                  label: "Notes",
                  value: movement.notes?.trim() ? movement.notes : "—",
                },
              ],
            },
          ]}
        />
      </DetailPageMainSection>
    </DetailPageTabsSection>
  );
}
