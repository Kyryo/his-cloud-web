"use client";

import { TableEntityCell } from "@/components/table-text-cell";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { InternalOrderStatusBadge } from "@/features/inventory/components/InventoryStatusBadge";
import type { InternalOrder } from "@/features/inventory/types/inventory.types";
import { formatDisplayDateTime } from "@/features/inventory/utils/format-inventory";

type InternalOrdersTableProps = {
  orders: InternalOrder[];
  onRowClick?: (order: InternalOrder) => void;
  className?: string;
};

const columns = [
  { key: "reference", label: "Reference" },
  { key: "source", label: "Source" },
  { key: "destination", label: "Destination" },
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
          const creatorName = order.created_by_name?.trim();

          return (
            <ListPageDataTableRow
              key={order.uuid}
              className="group cursor-pointer transition-colors hover:bg-slate-50/70"
              onClick={() => onRowClick?.(order)}
            >
              <ListPageDataTableCell className="py-3 font-mono text-sm font-semibold text-brand-navy group-hover:text-brand-primary">
                {order.reference_number}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 text-sm text-brand-navy">
                {order.source_location_name?.trim() ||
                  `Location ${order.source_location}`}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 text-sm text-brand-navy">
                {order.destination_location_name?.trim() ||
                  `Location ${order.destination_location}`}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                <InternalOrderStatusBadge status={order.status} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                {creatorName ? (
                  <TableEntityCell name={creatorName} />
                ) : (
                  <TableEntityCell name="" unassigned unassignedLabel="Unknown" />
                )}
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
