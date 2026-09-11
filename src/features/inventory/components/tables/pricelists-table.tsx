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

type PricelistsTableProps = {
  pricelists: CatalogPricelist[];
  onRowClick?: (pricelist: CatalogPricelist) => void;
  className?: string;
};

const columns = [
  { key: "name", label: "Pricelist" },
  { key: "currency", label: "Currency" },
  { key: "status", label: "Status" },
] as const;

export function PricelistsTable({
  pricelists,
  onRowClick,
  className,
}: PricelistsTableProps) {
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
        {pricelists.map((pricelist) => (
          <ListPageDataTableRow
            key={pricelist.uuid}
            className="group cursor-pointer"
            onClick={() => onRowClick?.(pricelist)}
          >
            <ListPageDataTableCell className="py-3">
              <span className="block truncate text-sm font-semibold text-brand-navy group-hover:text-brand-primary">
                {pricelist.name}
              </span>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3 font-mono text-sm font-medium text-brand-navy">
              {pricelist.currency_code || "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3">
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
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
