"use client";

import { TableEntityCell } from "@/components/table-text-cell";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { StockAdjustmentStatusBadge } from "@/features/inventory/components/InventoryStatusBadge";
import type { StockAdjustment } from "@/features/inventory/types/inventory.types";
import {
  formatAdjustmentTypeLabel,
  formatDisplayDateTime,
} from "@/features/inventory/utils/format-inventory";

type StockAdjustmentsTableProps = {
  adjustments: StockAdjustment[];
  onRowClick?: (adjustment: StockAdjustment) => void;
  className?: string;
};

const columns = [
  { key: "reference", label: "Reference" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "location", label: "Location" },
  { key: "created_by", label: "Created by" },
  { key: "created_at", label: "Created at" },
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
          const creatorName = adjustment.created_by_name?.trim();

          return (
            <ListPageDataTableRow
              key={adjustment.uuid}
              className="group cursor-pointer transition-colors hover:bg-slate-50/70"
              onClick={() => onRowClick?.(adjustment)}
            >
              <ListPageDataTableCell className="py-3 font-mono text-sm font-semibold text-brand-navy group-hover:text-brand-primary">
                {adjustment.reference_number}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 text-sm text-brand-navy">
                {formatAdjustmentTypeLabel(adjustment.adjustment_type)}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                <StockAdjustmentStatusBadge status={adjustment.status} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 text-sm text-brand-navy">
                {adjustment.location_name?.trim() ||
                  `Location ${adjustment.location}`}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                {creatorName ? (
                  <TableEntityCell name={creatorName} />
                ) : (
                  <TableEntityCell name="" unassigned unassignedLabel="Unknown" />
                )}
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
