"use client";

import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";
import { ProductTypeBadge } from "@/features/inventory/components/ProductTypeBadge";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatInventoryAmount } from "@/features/inventory/utils/format-inventory";

const columns: InventoryListTableColumn<InventoryProduct>[] = [
  {
    key: "name",
    label: "Name",
    cellClassName: "font-medium text-brand-navy",
    render: (item) => item.display_name || item.name,
  },
  {
    key: "type",
    label: "Type",
    render: (item) => <ProductTypeBadge product={item} />,
  },
  {
    key: "code",
    label: "Code",
    render: (item) => item.default_code ?? "—",
  },
  {
    key: "barcode",
    label: "Barcode",
    render: (item) => item.barcode ?? "—",
  },
  {
    key: "list_price",
    label: "List price",
    headerClassName: "text-right",
    cellClassName: "text-right",
    render: (item) => formatInventoryAmount(item.list_price),
  },
];

type ProductsTableProps = {
  products: InventoryProduct[];
  onRowClick?: (product: InventoryProduct) => void;
};

export function ProductsTable({ products, onRowClick }: ProductsTableProps) {
  return (
    <InventoryListTable
      items={products}
      columns={columns}
      getRowKey={(product) => String(product.id)}
      onRowClick={onRowClick}
    />
  );
}
