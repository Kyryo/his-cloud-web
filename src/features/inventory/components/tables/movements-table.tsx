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
import { InventoryDocumentIdentity } from "@/features/inventory/components/InventoryDocumentIdentity";
import { InventoryLocationRoute } from "@/features/inventory/components/InventoryLocationChip";
import { MovementTypeBadge } from "@/features/inventory/components/InventoryStatusBadge";
import type { InventoryMovement } from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDateTime,
  formatInventoryQuantity,
} from "@/features/inventory/utils/format-inventory";
import { getStockProductDisplayName } from "@/features/inventory/utils/stock-product-mark";

type MovementsTableProps = {
  items: InventoryMovement[];
  onRowClick?: (item: InventoryMovement) => void;
  className?: string;
};

const columns = [
  { key: "product", label: "Product" },
  { key: "type", label: "Type" },
  { key: "route", label: "Route" },
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
          const subtitle = [
            `ID ${item.product_id}`,
            item.batch_number ? `Batch ${item.batch_number}` : null,
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <ListPageDataTableRow
              key={item.uuid}
              className="group cursor-pointer transition-colors hover:bg-slate-50/70"
              onClick={() => onRowClick?.(item)}
              data-testid={`movement-row-${item.uuid}`}
            >
              <ListPageDataTableCell className="py-3">
                <InventoryDocumentIdentity
                  kind="movement"
                  mark={productName}
                  title={productName}
                  subtitle={subtitle}
                />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                <MovementTypeBadge type={item.movement_type} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                <InventoryLocationRoute
                  from={item.from_location_name}
                  to={item.to_location_name}
                />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 pr-4 text-right">
                <span className="text-base font-semibold tabular-nums text-brand-navy">
                  {formatInventoryQuantity(item.quantity)}
                </span>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 text-sm tabular-nums text-dash-muted">
                {formatDisplayDateTime(item.created_at)}
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
