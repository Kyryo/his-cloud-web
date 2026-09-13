"use client";

import Link from "next/link";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

import { HoverPreviewCard } from "@/components/hover-preview-card";
import { UserIdenticon } from "@/components/UserIdenticon";
import {
  TableAmountCell,
  TableEntityCell,
} from "@/components/table-text-cell";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
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
import { useToast } from "@/providers/toast-provider";

type SalesOrdersTableProps = {
  orders: SalesOrder[];
  onRowClick?: (order: SalesOrder) => void;
  className?: string;
};

const columns = [
  { key: "order", label: "Order Number" },
  { key: "customer", label: "Client" },
  { key: "provider", label: "Care provider", className: "hidden md:table-cell" },
  { key: "pricelist", label: "Pricelist", className: "hidden lg:table-cell" },
  { key: "date", label: "Order Date" },
  { key: "state", label: "State" },
  { key: "total", label: "Total", className: "text-right pr-4" },
] as const;

export const SALES_ORDER_TABLE_SKELETON_COLUMNS = [
  { key: "order", label: "Order Number" },
  { key: "customer", label: "Client" },
  { key: "provider", label: "Care provider", headerClassName: "hidden md:table-cell" },
  { key: "pricelist", label: "Pricelist", headerClassName: "hidden lg:table-cell" },
  { key: "date", label: "Order Date" },
  { key: "state", label: "State" },
  { key: "total", label: "Total", headerClassName: "text-right pr-4" },
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
    <div className="space-y-3">
      <div>
        <p className="font-normal text-brand-navy">{order.name || `#${order.id}`}</p>
        <p className="font-mono text-sm text-brand-muted">ERP reference #{order.id}</p>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
        <dt className="text-brand-muted">Client</dt>
        <dd className="font-medium text-brand-navy">{formatSalesOrderCustomer(order)}</dd>
        <dt className="text-brand-muted">Provider</dt>
        <dd className="font-medium text-brand-navy">{formatSalesOrderProvider(order)}</dd>
        <dt className="text-brand-muted">Order date</dt>
        <dd className="font-medium text-brand-navy">{formatSalesOrderDateTime(order.date_order)}</dd>
        <dt className="text-brand-muted">Clinic</dt>
        <dd className="font-medium text-brand-navy">{formatSalesOrderClinicName(order)}</dd>
        <dt className="text-brand-muted">Pricelist</dt>
        <dd className="font-medium text-brand-navy">{formatSalesOrderPricelist(order)}</dd>
        <dt className="text-brand-muted">State</dt>
        <dd>
          <SalesOrderStateBadge state={order.state} />
        </dd>
        <dt className="text-brand-muted">Total</dt>
        <dd className="font-semibold text-brand-navy">
          <TableAmountCell value={order.amount_total} currency={currency} />
        </dd>
      </dl>
      <div className="border-t border-dash-border/60 pt-2">
        <Link
          href={ROUTES.salesOrderDetail(order.uuid)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover"
        >
          <span>Open order details</span>
          <ExternalLink className="size-3" />
        </Link>
      </div>
    </div>
  );
}

export function SalesOrdersTable({
  orders,
  onRowClick,
  className,
}: SalesOrdersTableProps) {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyOrderNumber = (event: React.MouseEvent, order: SalesOrder) => {
    event.stopPropagation();
    const orderLabel = order.name || `#${order.id}`;
    void navigator.clipboard.writeText(orderLabel);
    setCopiedId(order.uuid);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      variant: "success",
      title: "Order number copied",
      description: `${orderLabel} copied to clipboard.`,
    });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <ListPageDataTable className={className}>
        <ListPageDataTableHeader>
          <ListPageDataTableHeaderRow>
            {columns.map((column) => (
              <ListPageDataTableHeaderCell
                key={column.key}
                className={"className" in column ? column.className : undefined}
              >
                {column.label}
              </ListPageDataTableHeaderCell>
            ))}
          </ListPageDataTableHeaderRow>
        </ListPageDataTableHeader>
        <ListPageDataTableBody>
          {orders.map((order) => {
            const currency = formatSalesOrderCurrency(order);
            const orderLabel = order.name || `#${order.id}`;
            const customerName = formatSalesOrderCustomer(order);
            const isCopied = copiedId === order.uuid;

            return (
              <ListPageDataTableRow
                key={order.id}
                className="group cursor-pointer"
                onClick={() => onRowClick?.(order)}
              >
                {/* 1. Order Number */}
                <ListPageDataTableCell>
                  <div className="flex items-center gap-1.5">
                    <HoverPreviewCard
                      trigger={
                        <Link
                          href={ROUTES.salesOrderDetail(order.uuid)}
                          className="font-mono font-normal tracking-tight text-brand-navy transition-colors hover:text-brand-primary"
                          title={orderLabel}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {orderLabel}
                        </Link>
                      }
                    >
                      <SalesOrderHoverPreview order={order} />
                    </HoverPreviewCard>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => handleCopyOrderNumber(e, order)}
                          className="rounded p-1 text-dash-muted opacity-0 transition-all hover:bg-slate-100 hover:text-brand-navy group-hover:opacity-100 focus-visible:opacity-100"
                          aria-label="Copy order number"
                        >
                          {isCopied ? (
                            <Check className="size-3 text-emerald-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {isCopied ? "Copied!" : "Copy order number"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </ListPageDataTableCell>

                {/* 2. Client / Customer */}
                <ListPageDataTableCell>
                  <div className="flex min-w-0 items-center gap-2.5">
                    <UserIdenticon
                      seed={customerName}
                      name={customerName}
                      className="size-8 shrink-0 rounded-md"
                    />
                    <span className="truncate font-medium text-brand-navy">
                      {customerName}
                    </span>
                  </div>
                </ListPageDataTableCell>

                {/* 3. Provider */}
                <ListPageDataTableCell className="hidden md:table-cell">
                  <SalesOrderProviderCell order={order} />
                </ListPageDataTableCell>

                {/* 4. Pricelist */}
                <ListPageDataTableCell className="hidden text-brand-slate lg:table-cell">
                  {formatSalesOrderPricelist(order)}
                </ListPageDataTableCell>

                {/* 5. Date */}
                <ListPageDataTableCell className="tabular-nums text-dash-muted">
                  {formatSalesOrderDateTime(order.date_order)}
                </ListPageDataTableCell>

                {/* 6. State */}
                <ListPageDataTableCell>
                  <SalesOrderStateBadge state={order.state} />
                </ListPageDataTableCell>

                {/* 7. Total */}
                <ListPageDataTableCell className="pr-4 text-right">
                  <TableAmountCell
                    value={order.amount_total}
                    currency={currency}
                  />
                </ListPageDataTableCell>
              </ListPageDataTableRow>
            );
          })}
        </ListPageDataTableBody>
      </ListPageDataTable>
    </TooltipProvider>
  );
}
