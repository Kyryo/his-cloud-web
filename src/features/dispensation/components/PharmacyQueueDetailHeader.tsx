"use client";

import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import type { ReactNode } from "react";

import { UserIdenticon } from "@/components/UserIdenticon";
import { ROUTES } from "@/constants/routes";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { PharmacyQueueDispenseStatusBadge } from "@/features/dispensation/components/PharmacyQueueDispenseStatusBadge";
import type { DispensationQueueDetail } from "@/features/dispensation/types/dispensation.types";
import { summarizeQueueLines } from "@/features/dispensation/utils/dispensation-qty";
import { SalesOrderStateBadge } from "@/features/sales-orders/components/SalesOrderStatusBadge";
import { formatSalesOrderDateTime } from "@/features/sales-orders/utils/format-sales-order";

type PharmacyQueueDetailHeaderProps = {
  detail: DispensationQueueDetail;
  customerUuid?: string | null;
  actions?: ReactNode;
};

export function PharmacyQueueDetailHeader({
  detail,
  customerUuid,
  actions,
}: PharmacyQueueDetailHeaderProps) {
  const clientName = detail.customer_name?.trim() || "No client";
  const orderLabel = detail.name || `Order #${detail.id}`;
  const summary = summarizeQueueLines(detail.lines);
  const identiconSeed = customerUuid || clientName;

  return (
    <DetailPageHeaderSection className="border-b-0 bg-white px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:gap-4">
          <UserIdenticon
            seed={identiconSeed}
            name={clientName}
            className="size-12 shrink-0 rounded-lg shadow-2xs sm:size-14"
            fallbackClassName="text-base font-semibold sm:text-lg"
          />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {customerUuid ? (
                <Link
                  href={ROUTES.customerDetail(customerUuid)}
                  className="truncate text-lg font-bold tracking-tight text-brand-navy hover:text-brand-primary sm:text-2xl"
                >
                  {clientName}
                </Link>
              ) : (
                <h1 className="truncate text-lg font-bold tracking-tight text-brand-navy sm:text-2xl">
                  {clientName}
                </h1>
              )}
              <span className="font-mono text-sm font-medium text-brand-muted">
                {orderLabel}
              </span>
              <PharmacyQueueDispenseStatusBadge status={summary.status} />
              <SalesOrderStateBadge state={detail.state} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                {detail.clinic_name || "No clinic"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
                Ordered {formatSalesOrderDateTime(detail.date_order)}
              </span>
              <span>
                {summary.remainingLineCount} of {summary.lineCount} lines waiting
              </span>
            </div>
          </div>
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </DetailPageHeaderSection>
  );
}
