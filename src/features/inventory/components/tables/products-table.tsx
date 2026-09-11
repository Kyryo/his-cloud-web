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
import { ProductTypeBadge } from "@/features/inventory/components/ProductTypeBadge";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatInventoryAmount } from "@/features/inventory/utils/format-inventory";

type ProductsTableProps = {
  products: InventoryProduct[];
  onRowClick?: (product: InventoryProduct) => void;
  className?: string;
};

const columns = [
  { key: "name", label: "Product" },
  { key: "type", label: "Type" },
  { key: "code", label: "Code" },
  { key: "barcode", label: "Barcode", className: "hidden md:table-cell" },
  { key: "list_price", label: "List price", className: "text-right pr-4" },
] as const;

export function ProductsTable({
  products,
  onRowClick,
  className,
}: ProductsTableProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
            <ListPageDataTableHeaderCell key={column.key} className={"className" in column ? column.className : undefined}>
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {products.map((product) => {
          const name = product.display_name || product.name;

          return (
            <ListPageDataTableRow
              key={product.uuid}
              className="group cursor-pointer"
              onClick={() => onRowClick?.(product)}
            >
              <ListPageDataTableCell className="py-3">
                <span className="block truncate text-sm font-semibold text-brand-navy group-hover:text-brand-primary">
                  {name}
                </span>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                <ProductTypeBadge product={product} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 font-mono text-sm font-medium text-brand-navy">
                {product.default_code || "—"}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden py-3 font-mono text-sm text-brand-slate md:table-cell">
                {product.barcode || "—"}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 pr-4 text-right text-sm font-semibold tabular-nums text-brand-navy">
                {formatInventoryAmount(product.list_price)}
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
