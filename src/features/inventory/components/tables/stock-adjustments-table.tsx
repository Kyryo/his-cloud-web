"use client";

import { TableEntityCell } from "@/components/table-text-cell";
import { StockAdjustmentStatusBadge } from "@/features/inventory/components/InventoryStatusBadge";
import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";
import type { StockAdjustment } from "@/features/inventory/types/inventory.types";
import {
  formatAdjustmentTypeLabel,
  formatDisplayDateTime,
} from "@/features/inventory/utils/format-inventory";

const columns: InventoryListTableColumn<StockAdjustment>[] = [
  {
    key: "reference",
    label: "Reference",
    cellClassName: "font-mono font-medium text-brand-navy",
    render: (item) => item.reference_number,
  },
  {
    key: "type",
    label: "Type",
    render: (item) => formatAdjustmentTypeLabel(item.adjustment_type),
  },
  {
    key: "status",
    label: "Status",
    render: (item) => <StockAdjustmentStatusBadge status={item.status} />,
  },
  {
    key: "location",
    label: "Location",
    render: (item) => item.location_name?.trim() || `Location ${item.location}`,
  },
  {
    key: "created_by",
    label: "Created by",
    render: (item) => {
      const creatorName = item.created_by_name?.trim();
      if (!creatorName) {
        return <TableEntityCell name="" unassigned unassignedLabel="Unknown" />;
      }
      return <TableEntityCell name={creatorName} />;
    },
  },
  {
    key: "created_at",
    label: "Created at",
    render: (item) => formatDisplayDateTime(item.created_at),
  },
];

type StockAdjustmentsTableProps = {
  adjustments: StockAdjustment[];
  onRowClick?: (adjustment: StockAdjustment) => void;
};

export function StockAdjustmentsTable({
  adjustments,
  onRowClick,
}: StockAdjustmentsTableProps) {
  return (
    <InventoryListTable
      items={adjustments}
      columns={columns}
      getRowKey={(adjustment) => adjustment.uuid}
      onRowClick={onRowClick}
    />
  );
}
