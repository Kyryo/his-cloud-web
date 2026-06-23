"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InventoryMovement } from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDateTime,
  formatInventoryAmount,
  formatInventoryQuantity,
  formatMovementTypeLabel,
} from "@/features/inventory/utils/format-inventory";
import { appFont } from "@/lib/fonts";

type MovementDetailDialogProps = {
  movement: InventoryMovement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DETAIL_FIELDS: Array<{
  label: string;
  value: (movement: InventoryMovement) => string;
}> = [
  {
    label: "Type",
    value: (movement) => formatMovementTypeLabel(movement.movement_type),
  },
  {
    label: "Product",
    value: (movement) =>
      movement.product_name?.trim() || String(movement.product_id),
  },
  { label: "Batch", value: (movement) => movement.batch_number ?? "—" },
  {
    label: "From location",
    value: (movement) => movement.from_location_name ?? "—",
  },
  {
    label: "To location",
    value: (movement) => movement.to_location_name ?? "—",
  },
  {
    label: "Unit cost",
    value: (movement) => formatInventoryAmount(movement.unit_cost),
  },
  { label: "Reference", value: (movement) => movement.reference_model ?? "—" },
  {
    label: "Created",
    value: (movement) => formatDisplayDateTime(movement.created_at),
  },
  {
    label: "Notes",
    value: (movement) => (movement.notes?.trim() ? movement.notes : "—"),
  },
];

export function MovementDetailDialog({
  movement,
  open,
  onOpenChange,
}: MovementDetailDialogProps) {
  if (!movement) {
    return null;
  }

  const title = formatMovementTypeLabel(movement.movement_type);
  const subtitle = [
    movement.product_name?.trim() || `Product ${movement.product_id}`,
    movement.from_location_name,
    movement.to_location_name ? `→ ${movement.to_location_name}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`gap-0 overflow-hidden p-0 sm:max-w-lg ${appFont.className}`}
        data-testid="movement-detail-dialog"
      >
        <DialogHeader className="space-y-1 border-b border-brand-border px-6 py-5 text-left">
          <DialogTitle className="text-lg font-semibold text-brand-navy">
            {title}
          </DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-brand-border bg-slate-50/50 px-4 py-3">
              <p className="text-xs text-brand-muted">Quantity</p>
              <p className="mt-1 text-lg font-semibold text-brand-navy">
                {formatInventoryQuantity(movement.quantity)}
              </p>
            </div>
            <div className="rounded-lg border border-brand-border bg-slate-50/50 px-4 py-3">
              <p className="text-xs text-brand-muted">Total cost</p>
              <p className="mt-1 text-lg font-semibold text-brand-navy">
                {formatInventoryAmount(movement.total_cost)}
              </p>
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            {DETAIL_FIELDS.map((field) => (
              <div key={field.label}>
                <dt className="text-xs text-brand-muted">{field.label}</dt>
                <dd className="mt-1 text-sm font-medium text-brand-navy">
                  {field.value(movement)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </DialogContent>
    </Dialog>
  );
}
