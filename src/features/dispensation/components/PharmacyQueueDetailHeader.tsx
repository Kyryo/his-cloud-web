"use client";

import { Calendar } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";
import {
  SalesOrderInvoiceStatusBadge,
  SalesOrderStateBadge,
} from "@/features/sales-orders/components/SalesOrderStatusBadge";
import type { DispensationQueueDetail } from "@/features/dispensation/types/dispensation.types";
import { formatSalesOrderDateTime } from "@/features/sales-orders/utils/format-sales-order";

type PharmacyQueueDetailHeaderProps = {
  detail: DispensationQueueDetail;
  actions?: ReactNode;
};

export function PharmacyQueueDetailHeader({
  detail,
  actions,
}: PharmacyQueueDetailHeaderProps) {
  const orderLabel = detail.name || `Order #${detail.id}`;

  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
              {detail.customer_name || "No customer"}
            </h1>
            <SalesOrderStateBadge state={detail.state} />
            <SalesOrderInvoiceStatusBadge status={detail.invoice_status} />
            <Badge
              variant="secondary"
              className="max-w-[14rem] truncate font-normal"
              title={detail.clinic_name || "No clinic"}
            >
              {detail.clinic_name || "No clinic"}
            </Badge>
          </div>

          <p className="mt-1 font-mono text-sm text-brand-muted">{orderLabel}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
              Ordered {formatSalesOrderDateTime(detail.date_order)}
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
