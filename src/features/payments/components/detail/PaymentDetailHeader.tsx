"use client";

import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import type { Payment } from "@/features/payments/types/payment.types";
import {
  formatPaymentCustomer,
  formatPaymentDate,
} from "@/features/payments/utils/format-payment";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";

type PaymentDetailHeaderProps = {
  payment: Payment;
};

export function PaymentDetailHeader({ payment }: PaymentDetailHeaderProps) {
  const paymentLabel = payment.name || `Payment #${payment.id}`;
  const customerName = formatPaymentCustomer(payment);

  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
              {customerName}
            </h1>
            <PaymentStatusBadge state={payment.state} />
          </div>

          <p className="mt-1 font-mono text-sm text-brand-muted">{paymentLabel}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
            <span>Paid {formatPaymentDate(payment.payment_date)}</span>
          </div>
        </div>
      </div>
    </DetailPageHeaderSection>
  );
}
