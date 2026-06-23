"use client";

import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";
import type { InventoryMovement } from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDateTime,
  formatInventoryQuantity,
  formatMovementTypeLabel,
} from "@/features/inventory/utils/format-inventory";

const columns: InventoryListTableColumn<InventoryMovement>[] = [
  {
    key: "type",
    label: "Type",
    render: (item) => formatMovementTypeLabel(item.movement_type),
  },
  {
    key: "product",
    label: "Product",
    cellClassName: "text-brand-navy",
    render: (item) => item.product_name?.trim() || `Product ${item.product_id}`,
  },
  {
    key: "from",
    label: "From",
    render: (item) => item.from_location_name ?? "—",
  },
  {
    key: "to",
    label: "To",
    render: (item) => item.to_location_name ?? "—",
  },
  {
    key: "qty",
    label: "Qty",
    headerClassName: "text-right",
    cellClassName: "text-right font-medium text-brand-navy",
    render: (item) => formatInventoryQuantity(item.quantity),
  },
  {
    key: "created",
    label: "Created",
    render: (item) => formatDisplayDateTime(item.created_at),
  },
];

type MovementsTableProps = {
  items: InventoryMovement[];
  onRowClick?: (item: InventoryMovement) => void;
};

export function MovementsTable({ items, onRowClick }: MovementsTableProps) {
  return (
    <InventoryListTable
      items={items}
      columns={columns}
      getRowKey={(item) => item.uuid}
      onRowClick={onRowClick}
    />
  );
}
