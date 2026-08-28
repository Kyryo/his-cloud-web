"use client";

import { TableAmountCell, TableTextCell } from "@/components/table-text-cell";
import { SecondaryButton } from "@/components/ui/app-buttons";
import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";
import type { CustomerSalesOrderRecord } from "@/features/customers/types/customer-billing.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { SalesOrderStateBadge } from "@/features/sales-orders/components/SalesOrderStatusBadge";
import type { SalesOrderState } from "@/features/sales-orders/types/sales-order.types";

type CustomerSalesOrdersTableProps = {
  orders: CustomerSalesOrderRecord[];
  onRowClick?: (order: CustomerSalesOrderRecord) => void;
};

export function CustomerSalesOrdersTable({
  orders,
  onRowClick,
}: CustomerSalesOrdersTableProps) {
  const columns: InventoryListTableColumn<CustomerSalesOrderRecord>[] = [
    {
      key: "order",
      label: "Order",
      render: (order) => (
        <TableTextCell className="font-medium text-brand-navy">
          {order.name || `#${order.id}`}
        </TableTextCell>
      ),
    },
    {
      key: "date",
      label: "Order date",
      render: (order) => (
        <TableTextCell className="text-brand-slate">
          {formatDisplayDateTime(order.date_order)}
        </TableTextCell>
      ),
    },
    {
      key: "state",
      label: "Status",
      render: (order) => (
        <SalesOrderStateBadge state={order.state as SalesOrderState} />
      ),
    },
    {
      key: "total",
      label: "Total",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (order) => (
        <TableAmountCell value={order.amount_total} currency="MWK" />
      ),
    },
    {
      key: "actions",
      label: "",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (order) => (
        <div
          className="flex justify-end"
          onClick={(event) => event.stopPropagation()}
        >
          <SecondaryButton
            type="button"
            size="sm"
            onClick={() => onRowClick?.(order)}
          >
            View order
          </SecondaryButton>
        </div>
      ),
    },
  ];

  return (
    <InventoryListTable
      items={orders}
      columns={columns}
      getRowKey={(order) => String(order.id)}
      onRowClick={onRowClick}
    />
  );
}
