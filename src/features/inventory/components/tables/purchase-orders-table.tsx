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
import { PurchaseStatusBadge } from "@/features/inventory/components/InventoryStatusBadge";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDate,
  formatInventoryAmount,
} from "@/features/inventory/utils/format-inventory";

type PurchaseOrdersTableProps = {
  orders: PurchaseOrder[];
  onRowClick?: (order: PurchaseOrder) => void;
  className?: string;
};

const columns = [
  { key: "reference", label: "Reference" },
  { key: "vendor", label: "Vendor" },
  { key: "status", label: "Status" },
  { key: "delivery", label: "Delivery" },
  { key: "total", label: "Total", align: "right" as const },
] as const;

export const PURCHASE_ORDERS_TABLE_SKELETON_COLUMNS = columns;

export function PurchaseOrdersTable({
  orders,
  onRowClick,
  className,
}: PurchaseOrdersTableProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
            <ListPageDataTableHeaderCell
              key={column.key}
              className={column.align === "right" ? "text-right pr-4" : undefined}
            >
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {orders.map((order) => (
          <ListPageDataTableRow
            key={order.uuid}
            className="group cursor-pointer transition-colors hover:bg-slate-50/70"
            onClick={() => onRowClick?.(order)}
          >
            <ListPageDataTableCell className="py-3 font-mono text-sm font-semibold text-brand-navy group-hover:text-brand-primary">
              {order.reference_number}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3 text-sm font-medium text-brand-navy">
              {order.vendor_name}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3">
              <PurchaseStatusBadge status={order.status} />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3 text-sm tabular-nums text-dash-muted">
              {formatDisplayDate(order.delivery_date)}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3 pr-4 text-right text-sm font-semibold tabular-nums text-brand-navy">
              {formatInventoryAmount(order.total_value)}
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
