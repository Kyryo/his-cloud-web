"use client";

import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import type { InventoryStock } from "@/features/inventory/types/inventory.types";
import {
  formatInventoryAmount,
  formatInventoryQuantity,
} from "@/features/inventory/utils/format-inventory";

type StockTableProps = {
  items: InventoryStock[];
  onRowClick?: (item: InventoryStock) => void;
  className?: string;
};

const columns = [
  { key: "location", label: "Location" },
  { key: "product_name", label: "Product" },
  { key: "product", label: "Product ID" },
  { key: "batch", label: "Batch" },
  { key: "qty", label: "Qty on hand", align: "right" as const },
  { key: "cost", label: "Avg unit cost", align: "right" as const },
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
              className={column.align === "right" ? "text-right pr-4" : undefined}
            >
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {items.map((item) => (
          <ListPageDataTableRow
            key={item.uuid}
            className="group cursor-pointer transition-colors hover:bg-slate-50/70"
            onClick={() => onRowClick?.(item)}
          >
            <ListPageDataTableCell className="py-3 font-medium text-brand-navy">
              {item.location_name}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3 font-medium text-brand-navy">
              {item.product_name?.trim() || "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3 font-mono text-xs text-brand-navy">
              {item.product_id}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3 text-sm text-brand-slate">
              {item.batch_number ?? "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3 pr-4 text-right font-semibold tabular-nums text-brand-navy">
              {formatInventoryQuantity(item.quantity_on_hand)}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3 pr-4 text-right text-sm tabular-nums text-brand-navy">
              {formatInventoryAmount(item.average_unit_cost)}
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
