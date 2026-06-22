"use client";

import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";
import type { CatalogPricelist } from "@/features/catalog/types/catalog.types";

const columns: InventoryListTableColumn<CatalogPricelist>[] = [
  {
    key: "name",
    label: "Name",
    cellClassName: "font-medium text-brand-navy",
    render: (item) => item.name,
  },
  {
    key: "currency",
    label: "Currency",
    render: (item) => item.currency_code,
  },
  {
    key: "status",
    label: "Status",
    render: (item) => (item.is_active ? "Active" : "Archived"),
  },
];

type PricelistsTableProps = {
  pricelists: CatalogPricelist[];
  onRowClick?: (pricelist: CatalogPricelist) => void;
};

export function PricelistsTable({ pricelists, onRowClick }: PricelistsTableProps) {
  return (
    <InventoryListTable
      items={pricelists}
      columns={columns}
      getRowKey={(pricelist) => pricelist.uuid}
      onRowClick={onRowClick}
    />
  );
}
