"use client";

import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";
import type { InventoryBatch } from "@/features/inventory/types/inventory.types";
import { formatDisplayDate } from "@/features/inventory/utils/format-inventory";

const columns: InventoryListTableColumn<InventoryBatch>[] = [
  {
    key: "batch_number",
    label: "Batch number",
    cellClassName: "font-medium text-brand-navy",
    render: (item) => item.batch_number,
  },
  {
    key: "product",
    label: "Product ID",
    cellClassName: "font-mono text-brand-slate",
    render: (item) => item.odoo_product_id,
  },
  {
    key: "expiry",
    label: "Expiry",
    render: (item) => formatDisplayDate(item.expiry_date),
  },
  {
    key: "supplier",
    label: "Supplier",
    render: (item) => item.supplier ?? "—",
  },
  {
    key: "status",
    label: "Status",
    render: (item) => (item.is_active ? "Active" : "Inactive"),
  },
];

type BatchesTableProps = {
  items: InventoryBatch[];
  onRowClick?: (item: InventoryBatch) => void;
};

export function BatchesTable({ items, onRowClick }: BatchesTableProps) {
  return (
    <InventoryListTable
      items={items}
      columns={columns}
      getRowKey={(item) => item.uuid}
      onRowClick={onRowClick}
    />
  );
}
