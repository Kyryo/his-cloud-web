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
import type { Dispensation } from "@/features/dispensation/types/dispensation.types";
import { formatDispensationQuantity } from "@/features/dispensation/utils/dispensation-qty";
import { formatDisplayDateTime } from "@/features/inventory/utils/format-inventory";

type PharmacyHistoryTableProps = {
  items: Dispensation[];
  className?: string;
};

const columns = [
  { key: "when", label: "When" },
  { key: "order", label: "Order" },
  { key: "product", label: "Product" },
  { key: "location", label: "Location", className: "hidden md:table-cell" },
  { key: "qty", label: "Qty", align: "right" as const },
  { key: "by", label: "By", className: "hidden lg:table-cell" },
] as const;

export const PHARMACY_HISTORY_TABLE_SKELETON_COLUMNS = columns;

export function PharmacyHistoryTable({
  items,
  className,
}: PharmacyHistoryTableProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
            <ListPageDataTableHeaderCell
              key={column.key}
              className={
                "align" in column && column.align === "right"
                  ? "text-right pr-4"
                  : "className" in column
                    ? column.className
                    : undefined
              }
            >
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {items.map((item) => (
          <ListPageDataTableRow
            key={item.uuid}
            data-testid={`pharmacy-history-row-${item.uuid}`}
          >
            <ListPageDataTableCell className="tabular-nums text-dash-muted">
              {formatDisplayDateTime(item.dispensed_at)}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="font-mono font-medium text-brand-navy">
              {item.sales_order_name}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="font-medium text-brand-navy">
              {item.product_name ?? "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden text-brand-slate md:table-cell">
              {item.location_name}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="pr-4 text-right font-medium tabular-nums text-brand-navy">
              {formatDispensationQuantity(item.quantity)}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden text-brand-slate lg:table-cell">
              {item.dispensed_by_name ?? "—"}
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
