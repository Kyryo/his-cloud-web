"use client";

import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";
import type { InventoryStock } from "@/features/inventory/types/inventory.types";
import {
  formatInventoryAmount,
  formatInventoryQuantity,
} from "@/features/inventory/utils/format-inventory";

const columns: InventoryListTableColumn<InventoryStock>[] = [
  {
    key: "location",
    label: "Location",
    render: (item) => (
      <span className="font-medium text-brand-navy">{item.location_name}</span>
    ),
  },
  {
    key: "product_name",
    label: "Product",
    cellClassName: "font-medium text-brand-navy",
    render: (item) => item.product_name?.trim() || "—",
  },
  {
    key: "product",
    label: "Product ID",
    cellClassName: "font-mono text-brand-navy",
    render: (item) => item.product_id,
  },
  {
    key: "batch",
    label: "Batch",
    render: (item) => item.batch_number ?? "—",
  },
  {
    key: "qty",
    label: "Qty on hand",
    headerClassName: "text-right",
    cellClassName: "text-right font-medium text-brand-navy",
    render: (item) => formatInventoryQuantity(item.quantity_on_hand),
  },
  {
    key: "cost",
    label: "Avg unit cost",
    headerClassName: "text-right",
    cellClassName: "text-right",
    render: (item) => formatInventoryAmount(item.average_unit_cost),
  },
];

type StockTableProps = {
  items: InventoryStock[];
  onRowClick?: (item: InventoryStock) => void;
};

export function StockTable({ items, onRowClick }: StockTableProps) {
  return (
    <InventoryListTable
      items={items}
      columns={columns}
      getRowKey={(item) => item.uuid}
      onRowClick={onRowClick}
    />
  );
}
