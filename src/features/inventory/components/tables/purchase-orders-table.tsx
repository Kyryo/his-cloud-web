"use client";

import { PurchaseStatusBadge } from "@/features/inventory/components/InventoryStatusBadge";
import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDate,
  formatInventoryAmount,
} from "@/features/inventory/utils/format-inventory";

const columns: InventoryListTableColumn<PurchaseOrder>[] = [
  {
    key: "reference",
    label: "Reference",
    cellClassName: "font-mono font-medium text-brand-navy",
    render: (item) => item.reference_number,
  },
  {
    key: "vendor",
    label: "Vendor",
    render: (item) => item.vendor_name,
  },
  {
    key: "status",
    label: "Status",
    render: (item) => <PurchaseStatusBadge status={item.status} />,
  },
  {
    key: "delivery",
    label: "Delivery",
    render: (item) => formatDisplayDate(item.delivery_date),
  },
  {
    key: "total",
    label: "Total",
    headerClassName: "text-right",
    cellClassName: "text-right",
    render: (item) => formatInventoryAmount(item.total_value),
  },
];

type PurchaseOrdersTableProps = {
  orders: PurchaseOrder[];
  onRowClick?: (order: PurchaseOrder) => void;
};

export function PurchaseOrdersTable({ orders, onRowClick }: PurchaseOrdersTableProps) {
  return (
    <InventoryListTable
      items={orders}
      columns={columns}
      getRowKey={(order) => order.uuid}
      onRowClick={onRowClick}
    />
  );
}
