"use client";

import {
  InventoryDetailHero,
  InventoryDetailMeta,
  InventoryDetailMetrics,
  InventoryDetailSheet,
  InventoryDetailSheetHeader,
} from "@/features/inventory/components/InventoryDetailSheet";
import { InventoryLocationRoute } from "@/features/inventory/components/InventoryLocationChip";
import { MovementTypeBadge } from "@/features/inventory/components/InventoryStatusBadge";
import type { InventoryMovement } from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDateTime,
  formatInventoryAmount,
  formatInventoryQuantity,
  formatMovementTypeLabel,
} from "@/features/inventory/utils/format-inventory";
import { getStockProductDisplayName } from "@/features/inventory/utils/stock-product-mark";

type MovementDetailDialogProps = {
  movement: InventoryMovement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MovementDetailDialog({
  movement,
  open,
  onOpenChange,
}: MovementDetailDialogProps) {
  const productName = movement
    ? getStockProductDisplayName(movement.product_name, movement.product_id)
    : "Movement details";

  return (
    <InventoryDetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={productName}
      description="Quantity, route, and cost for this stock movement."
      data-testid="movement-detail-dialog"
    >
      {movement ? (
        <>
          <InventoryDetailSheetHeader
            kind="movement"
            seed={productName}
            title={productName}
            subtitle={
              movement.batch_number
                ? `ID ${movement.product_id} · Batch ${movement.batch_number}`
                : `ID ${movement.product_id}`
            }
            trailing={<MovementTypeBadge type={movement.movement_type} />}
          />

          <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 py-5">
            <InventoryDetailHero
              label="Quantity"
              value={formatInventoryQuantity(movement.quantity)}
              hint={formatMovementTypeLabel(movement.movement_type)}
            />

            <section className="space-y-2">
              <p className="text-sm text-dash-muted">Route</p>
              <InventoryLocationRoute
                from={movement.from_location_name}
                to={movement.to_location_name}
              />
            </section>

            <InventoryDetailMetrics
              items={[
                {
                  label: "Unit cost",
                  value: formatInventoryAmount(movement.unit_cost),
                },
                {
                  label: "Total cost",
                  value: formatInventoryAmount(movement.total_cost),
                },
              ]}
            />

            <InventoryDetailMeta
              rows={[
                {
                  label: "Reference",
                  value: movement.reference_model ?? "—",
                },
                {
                  label: "Created",
                  value: formatDisplayDateTime(movement.created_at),
                },
                {
                  label: "Notes",
                  value: movement.notes?.trim() ? movement.notes : "None added",
                },
              ]}
            />
          </div>
        </>
      ) : null}
    </InventoryDetailSheet>
  );
}
