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
import { InventoryDocumentIdentity } from "@/features/inventory/components/InventoryDocumentIdentity";
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
  { key: "order", label: "Order" },
  { key: "vendor", label: "Vendor" },
  { key: "status", label: "Status" },
  { key: "delivery", label: "Delivery" },
  { key: "total", label: "Total", align: "right" as const },
] as const;

export const PURCHASE_ORDERS_TABLE_SKELETON_COLUMNS = columns;

function getPurchaseOrderSubtitle(order: PurchaseOrder): string | null {
  const parts = [
    order.lpo_number ? `LPO ${order.lpo_number}` : null,
    order.grn_number ? `GRN ${order.grn_number}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : null;
}

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
              className={
                "align" in column && column.align === "right"
                  ? "text-right pr-4"
                  : undefined
              }
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
            className="group cursor-pointer"
            onClick={() => onRowClick?.(order)}
            data-testid={`purchase-order-row-${order.uuid}`}
          >
            <ListPageDataTableCell>
              <InventoryDocumentIdentity
                kind="purchase-order"
                mark={order.reference_number}
                title={order.reference_number}
                subtitle={getPurchaseOrderSubtitle(order)}
              />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <span className="block truncate font-medium text-brand-navy">
                {order.vendor_name || "—"}
              </span>
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <PurchaseStatusBadge status={order.status} />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="tabular-nums text-dash-muted">
              {formatDisplayDate(order.delivery_date)}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="pr-4 text-right">
              <p className="font-medium tabular-nums text-brand-navy">
                {formatInventoryAmount(order.total_value)}
              </p>
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
