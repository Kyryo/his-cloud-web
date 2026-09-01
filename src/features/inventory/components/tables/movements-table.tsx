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
import type { InventoryMovement } from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDateTime,
  formatInventoryQuantity,
  formatMovementTypeLabel,
} from "@/features/inventory/utils/format-inventory";

type MovementsTableProps = {
  items: InventoryMovement[];
  onRowClick?: (item: InventoryMovement) => void;
  className?: string;
};

const columns = [
  { key: "type", label: "Type" },
  { key: "product", label: "Product" },
  { key: "from", label: "From" },
  { key: "to", label: "To" },
  { key: "qty", label: "Qty", align: "right" as const },
  { key: "created", label: "Created" },
] as const;

export const MOVEMENTS_TABLE_SKELETON_COLUMNS = columns;

export function MovementsTable({
  items,
  onRowClick,
  className,
}: MovementsTableProps) {
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
            <ListPageDataTableCell className="py-3 text-sm font-medium text-brand-navy">
              {formatMovementTypeLabel(item.movement_type)}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3 text-sm text-brand-navy">
              {item.product_name?.trim() || `Product ${item.product_id}`}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3 text-sm text-brand-slate">
              {item.from_location_name ?? "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3 text-sm text-brand-slate">
              {item.to_location_name ?? "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3 pr-4 text-right font-semibold tabular-nums text-brand-navy">
              {formatInventoryQuantity(item.quantity)}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3 text-xs tabular-nums text-dash-muted">
              {formatDisplayDateTime(item.created_at)}
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
