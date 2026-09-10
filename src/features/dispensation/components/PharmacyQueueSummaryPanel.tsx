"use client";

import {
  DetailPageAsidePanelHeader,
  DetailPageAsidePanelSection,
  DetailPageAsideSummaryField,
  DetailPageAsideSummarySection,
} from "@/features/app-shell/components/page-layout";
import { PharmacyQueueDispenseStatusBadge } from "@/features/dispensation/components/PharmacyQueueDispenseStatusBadge";
import { PharmacyQueueLineProgress } from "@/features/dispensation/components/PharmacyQueueLineProgress";
import type { DispensationQueueDetail } from "@/features/dispensation/types/dispensation.types";
import {
  formatDispensationQuantity,
  summarizeQueueLines,
} from "@/features/dispensation/utils/dispensation-qty";
import { formatSalesOrderDateTime } from "@/features/sales-orders/utils/format-sales-order";
import {
  formatSalesOrderInvoiceStatusLabel,
  formatSalesOrderStateLabel,
} from "@/features/sales-orders/utils/sales-order-status";
import { cn } from "@/lib/utils";

type PharmacyQueueSummaryPanelProps = {
  detail: DispensationQueueDetail;
  className?: string;
};

export function PharmacyQueueSummaryPanel({
  detail,
  className,
}: PharmacyQueueSummaryPanelProps) {
  const summary = summarizeQueueLines(detail.lines);

  return (
    <DetailPageAsidePanelSection className={cn(className)}>
      <DetailPageAsidePanelHeader
        title="Dispensation"
        description="Progress against this sales order"
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-dash-muted">Remaining</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-brand-navy">
            {formatDispensationQuantity(summary.remainingQuantity)}
          </p>
          <p className="mt-1 text-xs text-brand-muted">
            {summary.progressPercent}% dispensed
          </p>
        </div>
        <PharmacyQueueDispenseStatusBadge status={summary.status} />
      </div>
      <PharmacyQueueLineProgress
        ordered={summary.orderedQuantity}
        dispensed={summary.dispensedQuantity}
      />

      <DetailPageAsideSummarySection title="Progress">
        <DetailPageAsideSummaryField
          label="Lines waiting"
          value={String(summary.remainingLineCount)}
        />
        <DetailPageAsideSummaryField
          label="Ordered"
          value={formatDispensationQuantity(summary.orderedQuantity)}
        />
        <DetailPageAsideSummaryField
          label="Dispensed"
          value={formatDispensationQuantity(summary.dispensedQuantity)}
        />
      </DetailPageAsideSummarySection>

      <DetailPageAsideSummarySection title="Order">
        <DetailPageAsideSummaryField label="Reference" value={detail.name} />
        <DetailPageAsideSummaryField
          label="Client"
          value={detail.customer_name || "—"}
        />
        <DetailPageAsideSummaryField
          label="Clinic"
          value={detail.clinic_name || "—"}
        />
        <DetailPageAsideSummaryField
          label="State"
          value={formatSalesOrderStateLabel(detail.state)}
        />
        <DetailPageAsideSummaryField
          label="Invoice"
          value={formatSalesOrderInvoiceStatusLabel(detail.invoice_status)}
        />
        <DetailPageAsideSummaryField
          label="Ordered"
          value={formatSalesOrderDateTime(detail.date_order)}
        />
      </DetailPageAsideSummarySection>
    </DetailPageAsidePanelSection>
  );
}
