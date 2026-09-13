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
import type { InventoryBatch } from "@/features/inventory/types/inventory.types";
import { formatDisplayDate } from "@/features/inventory/utils/format-inventory";

type BatchesTableProps = {
  items: InventoryBatch[];
  onRowClick?: (item: InventoryBatch) => void;
  className?: string;
};

const columns = [
  { key: "batch_number", label: "Batch number" },
  { key: "product", label: "Product ID" },
  { key: "expiry", label: "Expiry" },
  { key: "supplier", label: "Supplier" },
  { key: "status", label: "Status" },
] as const;

export const BATCHES_TABLE_SKELETON_COLUMNS = columns;

export function BatchesTable({ items, onRowClick, className }: BatchesTableProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
            <ListPageDataTableHeaderCell key={column.key}>
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {items.map((item) => (
          <ListPageDataTableRow
            key={item.uuid}
            className="group cursor-pointer"
            onClick={() => onRowClick?.(item)}
          >
            <ListPageDataTableCell className="font-medium text-brand-navy group-hover:text-brand-primary">
              {item.batch_number}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="font-mono text-brand-slate">
              {item.product_id}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="tabular-nums text-dash-muted">
              {formatDisplayDate(item.expiry_date)}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="text-brand-navy">
              {item.supplier ?? "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <span
                className={
                  item.is_active
                    ? "inline-flex rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-800"
                    : "inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700"
                }
              >
                {item.is_active ? "Active" : "Inactive"}
              </span>
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
