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
import { InventoryCreatedByCell } from "@/features/inventory/components/InventoryCreatedByCell";
import { InventoryDocumentIdentity } from "@/features/inventory/components/InventoryDocumentIdentity";
import { InventoryLocationChip } from "@/features/inventory/components/InventoryLocationChip";
import {
  AdjustmentTypeBadge,
  StockAdjustmentStatusBadge,
} from "@/features/inventory/components/InventoryStatusBadge";
import type { StockAdjustment } from "@/features/inventory/types/inventory.types";
import { formatDisplayDateTime } from "@/features/inventory/utils/format-inventory";

type StockAdjustmentsTableProps = {
  adjustments: StockAdjustment[];
  onRowClick?: (adjustment: StockAdjustment) => void;
  className?: string;
};

const columns = [
  { key: "adjustment", label: "Adjustment" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "location", label: "Location" },
  { key: "created_by", label: "Created by" },
  { key: "created_at", label: "Created" },
] as const;

export const STOCK_ADJUSTMENTS_TABLE_SKELETON_COLUMNS = columns;

export function StockAdjustmentsTable({
  adjustments,
  onRowClick,
  className,
}: StockAdjustmentsTableProps) {
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
        {adjustments.map((adjustment) => {
          const location =
            adjustment.location_name?.trim() ||
            `Location ${adjustment.location}`;

          return (
            <ListPageDataTableRow
              key={adjustment.uuid}
              className="group cursor-pointer"
              onClick={() => onRowClick?.(adjustment)}
              data-testid={`stock-adjustment-row-${adjustment.uuid}`}
            >
              <ListPageDataTableCell className="py-3">
                <InventoryDocumentIdentity
                  kind="adjustment"
                  mark={adjustment.reference_number}
                  title={adjustment.reference_number}
                  subtitle={adjustment.reason?.trim() || null}
                />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                <AdjustmentTypeBadge type={adjustment.adjustment_type} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                <StockAdjustmentStatusBadge status={adjustment.status} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                <InventoryLocationChip name={location} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                <InventoryCreatedByCell name={adjustment.created_by_name} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 text-sm tabular-nums text-dash-muted">
                {formatDisplayDateTime(adjustment.created_at)}
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
