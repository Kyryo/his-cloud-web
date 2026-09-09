"use client";

import {
  InventoryDetailHero,
  InventoryDetailMeta,
  InventoryDetailMetrics,
  InventoryDetailSheet,
  InventoryDetailSheetHeader,
} from "@/features/inventory/components/InventoryDetailSheet";
import { InventoryLocationChip } from "@/features/inventory/components/InventoryLocationChip";
import { StockQuantityStatusBadge } from "@/features/inventory/components/StockQuantityStatusBadge";
import type { InventoryStock } from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDateTime,
  formatInventoryAmount,
  formatInventoryQuantity,
} from "@/features/inventory/utils/format-inventory";
import { getStockProductDisplayName } from "@/features/inventory/utils/stock-product-mark";
import {
  getStockLineOnHandValue,
  getStockQuantityStatus,
} from "@/features/inventory/utils/stock-quantity-status";

type StockDetailDialogProps = {
  stock: InventoryStock | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StockDetailDialog({
  stock,
  open,
  onOpenChange,
}: StockDetailDialogProps) {
  const title = stock
    ? getStockProductDisplayName(stock.product_name, stock.product_id)
    : "Stock details";
  const status = stock
    ? getStockQuantityStatus(stock.quantity_on_hand)
    : "unknown";
  const lineValue = stock
    ? getStockLineOnHandValue(stock.quantity_on_hand, stock.average_unit_cost)
    : null;

  return (
    <InventoryDetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="On-hand quantity, cost, and location for this stock line."
      data-testid="stock-detail-dialog"
    >
      {stock ? (
        <>
          <InventoryDetailSheetHeader
            kind="product"
            seed={title}
            title={title}
            subtitle={`ID ${stock.product_id}`}
            trailing={<StockQuantityStatusBadge status={status} />}
          />

          <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 py-5">
            <InventoryDetailHero
              label="On hand"
              value={formatInventoryQuantity(stock.quantity_on_hand)}
              hint={
                stock.batch_number
                  ? `Batch ${stock.batch_number}`
                  : "No batch assigned"
              }
            />

            <InventoryDetailMetrics
              items={[
                {
                  label: "Unit cost",
                  value: formatInventoryAmount(stock.average_unit_cost),
                },
                {
                  label: "Line value",
                  value:
                    lineValue === null ? "—" : formatInventoryAmount(lineValue),
                },
              ]}
            />

            <section className="space-y-2">
              <p className="text-sm text-dash-muted">Location</p>
              <InventoryLocationChip name={stock.location_name} />
            </section>

            <InventoryDetailMeta
              rows={[
                {
                  label: "Record",
                  value: stock.is_active ? "Active" : "Inactive",
                },
                {
                  label: "Created",
                  value: formatDisplayDateTime(stock.created_at),
                },
                {
                  label: "Updated",
                  value: formatDisplayDateTime(stock.updated_at),
                },
              ]}
            />
          </div>
        </>
      ) : null}
    </InventoryDetailSheet>
  );
}
