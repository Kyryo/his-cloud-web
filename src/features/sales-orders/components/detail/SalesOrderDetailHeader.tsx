"use client";

import { Calendar, UserRound } from "lucide-react";

import {
  SalesOrderInvoiceStatusBadge,
  SalesOrderStateBadge,
} from "@/features/sales-orders/components/SalesOrderStatusBadge";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  formatSalesOrderAmount,
  formatSalesOrderCurrency,
  formatSalesOrderCustomer,
  formatSalesOrderDateTime,
} from "@/features/sales-orders/utils/format-sales-order";

type SalesOrderDetailHeaderProps = {
  order: SalesOrder;
};

export function SalesOrderDetailHeader({ order }: SalesOrderDetailHeaderProps) {
  const currency = formatSalesOrderCurrency(order);
  const orderLabel = order.name || `Order #${order.id}`;

  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate font-mono text-lg font-semibold text-brand-navy sm:text-xl">
              {orderLabel}
            </h1>
            <SalesOrderStateBadge state={order.state} />
            <SalesOrderInvoiceStatusBadge status={order.invoice_status} />
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-brand-muted">
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
              {formatSalesOrderCustomer(order)}
            </span>
            <span className="font-mono text-xs text-brand-slate">#{order.id}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
              Ordered {formatSalesOrderDateTime(order.date_order)}
            </span>
            <span className="text-sm font-medium text-brand-navy">
              {formatSalesOrderAmount(order.amount_total, currency)}
            </span>
          </div>
        </div>
      </div>
    </DetailPageHeaderSection>
  );
}
