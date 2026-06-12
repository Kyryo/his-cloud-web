"use client";

import { InternalOrderStatusBadge } from "@/features/inventory/components/InventoryStatusBadge";
import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";
import type { InternalOrder } from "@/features/inventory/types/inventory.types";
import { formatDisplayDateTime } from "@/features/inventory/utils/format-inventory";

const columns: InventoryListTableColumn<InternalOrder>[] = [
  {
    key: "reference",
    label: "Reference",
    cellClassName: "font-mono font-medium text-brand-navy",
    render: (item) => item.reference_number,
  },
  {
    key: "status",
    label: "Status",
    render: (item) => <InternalOrderStatusBadge status={item.status} />,
  },
  {
    key: "lines",
    label: "Lines",
    render: (item) => item.lines.length,
  },
  {
    key: "updated",
    label: "Updated",
    render: (item) => formatDisplayDateTime(item.updated_at),
  },
];

type InternalOrdersTableProps = {
  orders: InternalOrder[];
  onRowClick?: (order: InternalOrder) => void;
  compact?: boolean;
};

export function InternalOrdersTable({
  orders,
  onRowClick,
  compact = false,
}: InternalOrdersTableProps) {
  return (
    <InventoryListTable
      items={orders}
      columns={columns}
      getRowKey={(order) => order.uuid}
      onRowClick={onRowClick}
      compact={compact}
    />
  );
}
