"use client";

import Link from "next/link";

import {
  DetailPageAsidePanelHeader,
  DetailPageAsidePanelSection,
  DetailPageAsideSummaryAmountRow,
  DetailPageAsideSummaryField,
  DetailPageAsideSummaryHighlight,
  DetailPageAsideSummarySection,
} from "@/features/app-shell/components/page-layout";
import type { Payment } from "@/features/payments/types/payment.types";
import {
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
  return (
    <DetailPageAsidePanelSection className={cn(className)}>
      <DetailPageAsidePanelHeader
        title="Payment summary"
        description="Amount and payment details"
      />

      <DetailPageAsideSummaryHighlight title="Payment amount">
        <dl className="space-y-2.5">
          <DetailPageAsideSummaryAmountRow
            label="Amount received"
            value={formatPaymentAmount(payment.amount)}
            emphasized
          />
        </dl>
      </DetailPageAsideSummaryHighlight>

      <DetailPageAsideSummarySection title="Payment details">
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
        {payment.invoice_id ? (
          <DetailPageAsideSummaryField
            label="Invoice"
            value={
              <Link
                href={ROUTES.invoiceDetail(payment.invoice_id)}
                className="text-brand-primary hover:underline"
              >
                {payment.invoice_name || `#${payment.invoice_id}`}
              </Link>
            }
          />
        ) : null}
      </DetailPageAsideSummarySection>
    </DetailPageAsidePanelSection>
  );
}
