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
import { InventoryCreatedByCell } from "@/features/inventory/components/InventoryCreatedByCell";
import { InventoryDocumentIdentity } from "@/features/inventory/components/InventoryDocumentIdentity";
import { InventoryLocationRoute } from "@/features/inventory/components/InventoryLocationChip";
import { InternalOrderStatusBadge } from "@/features/inventory/components/InventoryStatusBadge";
import type { InternalOrder } from "@/features/inventory/types/inventory.types";
import { formatDisplayDateTime } from "@/features/inventory/utils/format-inventory";

type InternalOrdersTableProps = {
  orders: InternalOrder[];
  onRowClick?: (order: InternalOrder) => void;
  className?: string;
};

const columns = [
  { key: "order", label: "Order" },
  { key: "route", label: "Route" },
  { key: "status", label: "Status" },
  { key: "created_by", label: "Created by" },
  { key: "updated", label: "Updated" },
] as const;

export const INTERNAL_ORDERS_TABLE_SKELETON_COLUMNS = columns;

export function InternalOrdersTable({
  orders,
  onRowClick,
  className,
}: InternalOrdersTableProps) {
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
        {orders.map((order) => {
          const source =
            order.source_location_name?.trim() ||
            `Location ${order.source_location}`;
          const destination =
            order.destination_location_name?.trim() ||
            `Location ${order.destination_location}`;

          return (
            <ListPageDataTableRow
              key={order.uuid}
              className="group cursor-pointer transition-colors hover:bg-slate-50/70"
              onClick={() => onRowClick?.(order)}
              data-testid={`internal-order-row-${order.uuid}`}
            >
              <ListPageDataTableCell className="py-3">
                <InventoryDocumentIdentity
                  kind="internal-order"
                  mark={order.reference_number}
                  title={order.reference_number}
                  subtitle={order.notes?.trim() || null}
                />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                <InventoryLocationRoute from={source} to={destination} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                <InternalOrderStatusBadge status={order.status} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                <InventoryCreatedByCell name={order.created_by_name} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 text-sm tabular-nums text-dash-muted">
                {formatDisplayDateTime(order.updated_at)}
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
