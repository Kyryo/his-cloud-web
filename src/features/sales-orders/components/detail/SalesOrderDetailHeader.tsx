"use client";

import { Calendar } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { SalesOrderStateBadge } from "@/features/sales-orders/components/SalesOrderStatusBadge";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  formatSalesOrderCustomer,
  formatSalesOrderDateTime,
  formatSalesOrderPricelist,
} from "@/features/sales-orders/utils/format-sales-order";

type SalesOrderDetailHeaderProps = {
  order: SalesOrder;
  actions?: ReactNode;
};

export function SalesOrderDetailHeader({
  order,
  actions,
}: SalesOrderDetailHeaderProps) {
  const orderLabel = order.name || `Order #${order.id}`;
  const clientName = formatSalesOrderCustomer(order);
  const pricelistLabel = formatSalesOrderPricelist(order);
  const hasPricelist = Boolean(order.pricelist_name?.trim());

  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
              {clientName}
            </h1>
            <SalesOrderStateBadge state={order.state} />
            <Badge
              variant={hasPricelist ? "secondary" : "outline"}
              className="max-w-[14rem] truncate font-normal"
              title={pricelistLabel}
            >
              {pricelistLabel}
            </Badge>
          </div>

          <p className="mt-1 font-mono text-sm text-brand-muted">{orderLabel}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
              Ordered {formatSalesOrderDateTime(order.date_order)}
            </span>
          </div>
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </DetailPageHeaderSection>
  );
}
