"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InventoryBatch } from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDate,
  formatDisplayDateTime,
} from "@/features/inventory/utils/format-inventory";
import { appFont } from "@/lib/fonts";

type BatchDetailDialogProps = {
  batch: InventoryBatch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DETAIL_FIELDS: Array<{
  label: string;
  value: (batch: InventoryBatch) => string;
}> = [
  { label: "Batch number", value: (batch) => batch.batch_number },
  {
    label: "Product",
    value: (batch) => batch.product_name?.trim() || String(batch.product_id),
  },
  {
    label: "Expiry date",
    value: (batch) => formatDisplayDate(batch.expiry_date),
  },
  {
    label: "Manufacture date",
    value: (batch) => formatDisplayDate(batch.manufacture_date),
  },
  { label: "Supplier", value: (batch) => batch.supplier ?? "—" },
  {
    label: "Notes",
    value: (batch) => (batch.notes?.trim() ? batch.notes : "—"),
  },
  {
    label: "Status",
    value: (batch) => (batch.is_active ? "Active" : "Inactive"),
  },
  {
    label: "Created",
    value: (batch) => formatDisplayDateTime(batch.created_at),
  },
  {
    label: "Updated",
    value: (batch) => formatDisplayDateTime(batch.updated_at),
  },
];

export function BatchDetailDialog({
  batch,
  open,
  onOpenChange,
}: BatchDetailDialogProps) {
  if (!batch) {
    return null;
  }

  const title = batch.batch_number;
  const subtitle = [
    batch.product_name?.trim() || `Product ${batch.product_id}`,
    batch.supplier,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`gap-0 overflow-hidden p-0 sm:max-w-lg ${appFont.className}`}
        data-testid="batch-detail-dialog"
      >
        <DialogHeader className="space-y-1 border-b border-brand-border px-6 py-5 text-left">
          <DialogTitle className="text-lg font-semibold text-brand-navy">
            {title}
          </DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>

        <dl className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          {DETAIL_FIELDS.map((field) => (
            <div key={field.label}>
              <dt className="text-xs text-brand-muted">{field.label}</dt>
              <dd className="mt-1 text-sm font-medium text-brand-navy">
                {field.value(batch)}
              </dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
