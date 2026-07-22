"use client";

import Link from "next/link";

import { HoverPreviewCard } from "@/components/hover-preview-card";
import {
  TableAmountCell,
  TableEntityCell,
  TableTextCell,
} from "@/components/table-text-cell";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SalesOrderStateBadge } from "@/features/sales-orders/components/SalesOrderStatusBadge";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  formatSalesOrderClinicName,
  formatSalesOrderCurrency,
  formatSalesOrderCustomer,
  formatSalesOrderDateTime,
  formatSalesOrderPricelist,
  formatSalesOrderProvider,
} from "@/features/sales-orders/utils/format-sales-order";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type SalesOrdersTableProps = {
  orders: SalesOrder[];
  onRowClick?: (order: SalesOrder) => void;
  className?: string;
};

const columns = [
  { key: "order", label: "Order" },
  { key: "customer", label: "Customer" },
  { key: "provider", label: "Provider" },
  { key: "pricelist", label: "Pricelist" },
  { key: "date", label: "Order date" },
  { key: "state", label: "State" },
  { key: "total", label: "Total" },
] as const;

function SalesOrderProviderCell({ order }: { order: SalesOrder }) {
  const label = formatSalesOrderProvider(order);
  const unassigned = label === "Unassigned";

  return (
    <TableEntityCell
      name={unassigned ? "?" : label}
      label={unassigned ? undefined : label}
      unassigned={unassigned}
      unassignedLabel={label}
    />
  );
}

function SalesOrderHoverPreview({ order }: { order: SalesOrder }) {
  const currency = formatSalesOrderCurrency(order);

  return (
    <div className="space-y-2">
      <div>
        <p className="font-medium text-brand-navy">{order.name || `#${order.id}`}</p>
        <p className="text-xs text-brand-muted">ERP order #{order.id}</p>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <dt className="text-brand-muted">Customer</dt>
        <dd>{formatSalesOrderCustomer(order)}</dd>
        <dt className="text-brand-muted">Provider</dt>
        <dd>{formatSalesOrderProvider(order)}</dd>
        <dt className="text-brand-muted">Order date</dt>
        <dd>{formatSalesOrderDateTime(order.date_order)}</dd>
        <dt className="text-brand-muted">Clinic</dt>
        <dd>{formatSalesOrderClinicName(order)}</dd>
        <dt className="text-brand-muted">Pricelist</dt>
        <dd>{formatSalesOrderPricelist(order)}</dd>
        <dt className="text-brand-muted">State</dt>
        <dd>
          <SalesOrderStateBadge state={order.state} />
        </dd>
        <dt className="text-brand-muted">Total</dt>
        <dd>
          <TableAmountCell value={order.amount_total} currency={currency} />
        </dd>
      </dl>
    </div>
  );
}

export function SalesOrdersTable({
  orders,
  onRowClick,
  className,
}: SalesOrdersTableProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-brand-border bg-white",
          className,
        )}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="border-b border-brand-border bg-slate-50/80">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-sm font-medium text-brand-muted",
                      column.key === "total" ? "text-right" : "text-left",
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {orders.map((order) => {
                const currency = formatSalesOrderCurrency(order);
                const orderLabel = order.name || `#${order.id}`;
                const customerName = formatSalesOrderCustomer(order);

                return (
                  <tr
                    key={order.id}
                    className="cursor-pointer transition-colors hover:bg-slate-50/80"
                    onClick={() => onRowClick?.(order)}
                  >
                    <td className="px-4 py-3">
                      <HoverPreviewCard
                        trigger={
                          <Link
                            href={ROUTES.salesOrderDetail(order.id)}
                            className="block max-w-[10rem] truncate font-mono text-sm font-medium text-brand-navy hover:text-brand-primary hover:underline"
                            title={orderLabel}
                            onClick={(event) => event.stopPropagation()}
                          >
                            {orderLabel}
                          </Link>
                        }
                      >
                        <SalesOrderHoverPreview order={order} />
                      </HoverPreviewCard>
                    </td>
                    <td className="px-4 py-3">
                      <TableEntityCell name={customerName} />
                    </td>
                    <td className="px-4 py-3">
                      <SalesOrderProviderCell order={order} />
                    </td>
                    <td className="px-4 py-3">
                      <TableTextCell className="text-brand-slate">
                        {formatSalesOrderPricelist(order)}
                      </TableTextCell>
                    </td>
                    <td className="px-4 py-3">
                      <TableTextCell className="text-brand-slate">
                        {formatSalesOrderDateTime(order.date_order)}
                      </TableTextCell>
                    </td>
                    <td className="px-4 py-3">
                      <SalesOrderStateBadge state={order.state} />
                    </td>
                    <td className="px-4 py-3">
                      <TableAmountCell
                        value={order.amount_total}
                        currency={currency}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
}

type SalesOrdersPaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
};

export function SalesOrdersPagination({
  page,
  pageSize,
  totalCount,
  hasPrevious,
  hasNext,
  onPageChange,
  isLoading = false,
}: SalesOrdersPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-brand-muted">
        Showing {start}–{end} of {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPrevious || isLoading}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-brand-slate">
          Page {page} of {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNext || isLoading}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
