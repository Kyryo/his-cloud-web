"use client";

import Link from "next/link";

import {
  DetailPageAsidePanelHeader,
  DetailPageAsidePanelSection,
  DetailPageAsideSummaryField,
  DetailPageAsideSummarySection,
} from "@/features/app-shell/components/page-layout";
import type { Payment } from "@/features/payments/types/payment.types";
import {
  formatPaymentAllocationLabel,
  formatPaymentAmount,
  formatPaymentCustomer,
  formatPaymentDate,
  formatPaymentMethod,
} from "@/features/payments/utils/format-payment";
import { formatPaymentStateLabel } from "@/features/payments/utils/payment-status";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type PaymentSummaryPanelProps = {
  payment: Payment;
  className?: string;
};

export function PaymentSummaryPanel({
  payment,
  className,
}: PaymentSummaryPanelProps) {
  const allocationLabel = formatPaymentAllocationLabel(payment);
  const allocationHref =
    payment.invoice_id || payment.invoice_uuid
      ? ROUTES.invoiceDetail(payment.invoice_uuid ?? payment.invoice_id)
      : null;

  return (
    <DetailPageAsidePanelSection className={cn(className)}>
      <DetailPageAsidePanelHeader
        title="Payment summary"
        description="Amount and payment details"
      />

      <DetailPageAsideSummarySection title="Totals" className="border-t-0 pt-0">
        <DetailPageAsideSummaryField
          label="Amount received"
          value={formatPaymentAmount(payment.amount)}
        />
      </DetailPageAsideSummarySection>

      <DetailPageAsideSummarySection title="Details">
        <DetailPageAsideSummaryField
          label="State"
          value={formatPaymentStateLabel(payment.state)}
        />
        <DetailPageAsideSummaryField
          label="Client"
          value={formatPaymentCustomer(payment)}
        />
        <DetailPageAsideSummaryField
          label="Payment date"
          value={formatPaymentDate(payment.payment_date)}
        />
        <DetailPageAsideSummaryField
          label="Method"
          value={formatPaymentMethod(payment.payment_method)}
        />
        {payment.note?.trim() ? (
          <DetailPageAsideSummaryField label="Notes" value={payment.note} />
        ) : null}
        <DetailPageAsideSummaryField
          label="Allocation"
          value={
            allocationHref ? (
              <Link
                href={allocationHref}
                className="text-brand-primary hover:underline"
              >
                {allocationLabel}
              </Link>
            ) : (
              allocationLabel
            )
          }
        />
      </DetailPageAsideSummarySection>
    </DetailPageAsidePanelSection>
  );
}
