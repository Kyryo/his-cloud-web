"use client";

import { Badge } from "@/components/ui/badge";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { InventoryLocationChip } from "@/features/inventory/components/InventoryLocationChip";
import { StockProductMark } from "@/features/inventory/components/StockProductMark";
import { StockQuantityStatusBadge } from "@/features/inventory/components/StockQuantityStatusBadge";
import type { InventoryStock } from "@/features/inventory/types/inventory.types";
import {
  formatInventoryAmount,
  formatInventoryQuantity,
} from "@/features/inventory/utils/format-inventory";
import { getStockProductDisplayName } from "@/features/inventory/utils/stock-product-mark";
import {
  getStockLineOnHandValue,
  getStockQuantityStatus,
} from "@/features/inventory/utils/stock-quantity-status";

type StockTableProps = {
  items: InventoryStock[];
  onRowClick?: (item: InventoryStock) => void;
  className?: string;
};

const columns = [
  { key: "product", label: "Product" },
  { key: "location", label: "Location" },
  { key: "batch", label: "Batch" },
  { key: "qty", label: "On hand", align: "right" as const },
  { key: "value", label: "Value", align: "right" as const },
] as const;

export const STOCK_TABLE_SKELETON_COLUMNS = columns;

export function StockTable({ items, onRowClick, className }: StockTableProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
            <ListPageDataTableHeaderCell
              key={column.key}
              className={
                "align" in column && column.align === "right"
                  ? "text-right pr-4"
                  : undefined
              }
            >
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {items.map((item) => {
          const productName = getStockProductDisplayName(
            item.product_name,
            item.product_id,
          );
          const status = getStockQuantityStatus(item.quantity_on_hand);
          const lineValue = getStockLineOnHandValue(
            item.quantity_on_hand,
            item.average_unit_cost,
          );

          return (
            <ListPageDataTableRow
              key={item.uuid}
              className="group cursor-pointer"
              onClick={() => onRowClick?.(item)}
              data-testid={`stock-row-${item.uuid}`}
            >
              <ListPageDataTableCell>
                <div className="flex min-w-0 items-center gap-2.5">
                  <StockProductMark name={productName} />
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate font-medium text-brand-navy transition-colors group-hover:text-brand-primary">
                        {productName}
                      </span>
                      {!item.is_active ? (
                        <Badge
                          variant="outline"
                          className="shrink-0 font-normal text-brand-muted"
                        >
                          Inactive
                        </Badge>
                      ) : null}
                    </div>
                    <p className="font-mono text-xs text-brand-muted">
                      ID {item.product_id}
                    </p>
                  </div>
                </div>
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                <InventoryLocationChip name={item.location_name} />
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                {item.batch_number ? (
                  <span className="inline-flex rounded-md border border-dash-border bg-white px-2 py-0.5 font-mono text-xs text-brand-navy">
                    {item.batch_number}
                  </span>
                ) : (
                  <span className="text-xs text-dash-muted">No batch</span>
                )}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="pr-4 text-right">
                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-medium tabular-nums text-brand-navy">
                    {formatInventoryQuantity(item.quantity_on_hand)}
                  </span>
                  <StockQuantityStatusBadge status={status} />
                </div>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="pr-4 text-right">
                <p className="font-medium tabular-nums text-brand-navy">
                  {lineValue === null
                    ? "—"
                    : formatInventoryAmount(lineValue)}
                </p>
                <p className="mt-0.5 text-xs tabular-nums text-brand-muted">
                  {formatInventoryAmount(item.average_unit_cost)} / unit
                </p>
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
