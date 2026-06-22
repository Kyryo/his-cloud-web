"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InventoryStock } from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDateTime,
  formatInventoryAmount,
  formatInventoryQuantity,
} from "@/features/inventory/utils/format-inventory";
import { appFont } from "@/lib/fonts";

type StockDetailDialogProps = {
  stock: InventoryStock | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DETAIL_FIELDS: Array<{
  label: string;
  value: (stock: InventoryStock) => string;
}> = [
  { label: "Location", value: (stock) => stock.location_name },
  {
    label: "Product",
    value: (stock) =>
      stock.product_name?.trim() || String(stock.product_id),
  },
  { label: "Batch", value: (stock) => stock.batch_number ?? "—" },
  {
    label: "Status",
    value: (stock) => (stock.is_active ? "Active" : "Inactive"),
  },
  {
    label: "Created",
    value: (stock) => formatDisplayDateTime(stock.created_at),
  },
  {
    label: "Updated",
    value: (stock) => formatDisplayDateTime(stock.updated_at),
  },
];

export function StockDetailDialog({
  stock,
  open,
  onOpenChange,
}: StockDetailDialogProps) {
  if (!stock) {
    return null;
  }

  const title = stock.product_name?.trim() || `Product ${stock.product_id}`;
  const subtitle = [
    stock.location_name,
    stock.batch_number ? `Batch ${stock.batch_number}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`gap-0 overflow-hidden p-0 sm:max-w-lg ${appFont.className}`}
        data-testid="stock-detail-dialog"
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
              <p className="text-xs text-brand-muted">Qty on hand</p>
              <p className="mt-1 text-lg font-semibold text-brand-navy">
                {formatInventoryQuantity(stock.quantity_on_hand)}
              </p>
            </div>
            <div className="rounded-lg border border-brand-border bg-slate-50/50 px-4 py-3">
              <p className="text-xs text-brand-muted">Avg unit cost</p>
              <p className="mt-1 text-lg font-semibold text-brand-navy">
                {formatInventoryAmount(stock.average_unit_cost)}
              </p>
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            {DETAIL_FIELDS.map((field) => (
              <div key={field.label}>
                <dt className="text-xs text-brand-muted">{field.label}</dt>
                <dd className="mt-1 text-sm font-medium text-brand-navy">
                  {field.value(stock)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </DialogContent>
    </Dialog>
  );
}
