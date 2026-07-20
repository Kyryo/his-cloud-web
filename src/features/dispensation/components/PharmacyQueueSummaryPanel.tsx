"use client";

import {
  DetailPageAsidePanelHeader,
  DetailPageAsidePanelSection,
  DetailPageAsideSummaryAmountRow,
  DetailPageAsideSummaryField,
  DetailPageAsideSummaryHighlight,
  DetailPageAsideSummarySection,
} from "@/features/app-shell/components/page-layout";
import type { DispensationQueueDetail } from "@/features/dispensation/types/dispensation.types";
import { formatDispensationQuantity } from "@/features/dispensation/utils/dispensation-qty";
import {
  formatSalesOrderDateTime,
} from "@/features/sales-orders/utils/format-sales-order";
import { cn } from "@/lib/utils";

type PharmacyQueueSummaryPanelProps = {
  detail: DispensationQueueDetail;
  className?: string;
};

export function PharmacyQueueSummaryPanel({
  detail,
  className,
}: PharmacyQueueSummaryPanelProps) {
  const totalOrdered = detail.lines.reduce(
    (sum, line) => sum + Number(line.quantity || 0),
    0,
  );
  const totalDispensed = detail.lines.reduce(
    (sum, line) => sum + Number(line.dispensed_quantity || 0),
    0,
  );
  const totalRemaining = detail.lines.reduce(
    (sum, line) => sum + Number(line.remaining_quantity || 0),
    0,
  );

  return (
    <DetailPageAsidePanelSection className={cn(className)}>
      <DetailPageAsidePanelHeader
        title="Queue details"
        description="Dispensation progress and order context"
      />

      <DetailPageAsideSummaryHighlight title="Dispensation progress">
        <dl className="space-y-3">
          <DetailPageAsideSummaryAmountRow
            label="Lines waiting"
            value={String(
              detail.lines.filter((line) => Number(line.remaining_quantity) > 0).length,
            )}
          />
          <DetailPageAsideSummaryAmountRow
            label="Ordered quantity"
            value={formatDispensationQuantity(totalOrdered)}
          />
          <DetailPageAsideSummaryAmountRow
            label="Dispensed quantity"
            value={formatDispensationQuantity(totalDispensed)}
          />
          <DetailPageAsideSummaryAmountRow
            label="Remaining quantity"
            value={formatDispensationQuantity(totalRemaining)}
          />
        </dl>
      </DetailPageAsideSummaryHighlight>

      <DetailPageAsideSummarySection title="Order details">
        <DetailPageAsideSummaryField label="Order" value={detail.name} />
        <DetailPageAsideSummaryField
          label="Client"
          value={detail.customer_name || "—"}
        />
        <DetailPageAsideSummaryField
          label="Clinic"
          value={detail.clinic_name || "—"}
        />
        <DetailPageAsideSummaryField label="State" value={detail.state} />
        <DetailPageAsideSummaryField
          label="Invoice"
          value={detail.invoice_status}
        />
        <DetailPageAsideSummaryField
          label="Order date"
          value={formatSalesOrderDateTime(detail.date_order)}
        />
      </DetailPageAsideSummarySection>
    </DetailPageAsidePanelSection>
  );
}
