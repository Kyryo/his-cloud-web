"use client";

import { Calendar } from "lucide-react";

import { SalesOrderStateBadge } from "@/features/sales-orders/components/SalesOrderStatusBadge";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  formatSalesOrderCustomer,
  formatSalesOrderDateTime,
} from "@/features/sales-orders/utils/format-sales-order";

type SalesOrderDetailHeaderProps = {
  order: SalesOrder;
};

export function SalesOrderDetailHeader({ order }: SalesOrderDetailHeaderProps) {
  const orderLabel = order.name || `Order #${order.id}`;
  const clientName = formatSalesOrderCustomer(order);

  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
              {clientName}
            </h1>
            <SalesOrderStateBadge state={order.state} />
          </div>

          <p className="mt-1 font-mono text-sm text-brand-muted">{orderLabel}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
            <span className="font-mono text-brand-slate">#{order.id}</span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
              Ordered {formatSalesOrderDateTime(order.date_order)}
            </span>
          </div>
        </div>
      </div>
    </DetailPageHeaderSection>
  );
}
