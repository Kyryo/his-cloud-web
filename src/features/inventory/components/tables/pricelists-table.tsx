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
import type { CatalogPricelist } from "@/features/catalog/types/catalog.types";
import { InventoryCreatedByCell } from "@/features/inventory/components/InventoryCreatedByCell";
import { PRICELISTS_TABLE_COLUMNS } from "@/features/inventory/components/tables/pricelists-table-columns";
import { formatDisplayDateTime } from "@/features/inventory/utils/format-inventory";

type PricelistsTableProps = {
  pricelists: CatalogPricelist[];
  onRowClick?: (pricelist: CatalogPricelist) => void;
  className?: string;
};

export function PricelistsTable({
  pricelists,
  onRowClick,
  className,
}: PricelistsTableProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {PRICELISTS_TABLE_COLUMNS.map((column) => (
            <ListPageDataTableHeaderCell key={column.key}>
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {pricelists.map((pricelist) => (
          <ListPageDataTableRow
            key={pricelist.uuid}
            className="group cursor-pointer"
            onClick={() => onRowClick?.(pricelist)}
          >
            <ListPageDataTableCell>
              <span className="block truncate font-medium text-brand-navy group-hover:text-brand-primary">
                {pricelist.name}
              </span>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="font-mono font-medium text-brand-navy">
              {pricelist.currency_code || "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <span
                className={
                  pricelist.is_active
                    ? "inline-flex rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-800"
                    : "inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700"
                }
              >
                {pricelist.is_active ? "Active" : "Archived"}
              </span>
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <InventoryCreatedByCell
                name={pricelist.created_by_name}
                imageUrl={pricelist.created_by_avatar_url}
                size="sm"
              />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="tabular-nums text-dash-muted">
              {formatDisplayDateTime(pricelist.created_at)}
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
