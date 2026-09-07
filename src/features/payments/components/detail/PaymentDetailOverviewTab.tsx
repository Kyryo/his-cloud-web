"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { ROUTES } from "@/constants/routes";
import type { Payment } from "@/features/payments/types/payment.types";
import {
  formatPaymentAllocationLabel,
  formatPaymentAmount,
  formatPaymentCustomer,
  formatPaymentDate,
  formatPaymentMethod,
} from "@/features/payments/utils/format-payment";
import { cn } from "@/lib/utils";

type PaymentDetailOverviewTabProps = {
  payment: Payment;
  isActive: boolean;
};

function Fact({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 first:pt-0">
      <dt className="shrink-0 text-sm text-brand-muted">{label}</dt>
      <dd className="text-right text-sm text-brand-navy">{value}</dd>
    </div>
  );
}

export function PaymentDetailOverviewTab({
  payment,
  isActive,
}: PaymentDetailOverviewTabProps) {
  const notes = payment.note?.trim() || "";
  const recordedBy = payment.recorded_by_name?.trim() || payment.recorded_by_email?.trim() || "";
  const allocationLabel = formatPaymentAllocationLabel(payment);
  const invoiceRef = payment.invoice_uuid ?? payment.invoice_id ?? null;
  const allocationHref =
    invoiceRef != null ? ROUTES.invoiceDetail(invoiceRef) : null;

  return (
    <section
      className={cn(!isActive && "hidden")}
      data-testid="payment-detail-overview-tab"
    >
      <h2 className="text-sm font-semibold text-brand-navy">Payment details</h2>
      <dl className="mt-4 divide-y divide-dash-border/60">
        <Fact label="Reference" value={payment.name || `#${payment.id}`} />
        <Fact label="Client" value={formatPaymentCustomer(payment)} />
        <Fact label="Amount" value={formatPaymentAmount(payment.amount)} />
        <Fact label="Payment date" value={formatPaymentDate(payment.payment_date)} />
        <Fact label="Method" value={formatPaymentMethod(payment.payment_method)} />
        {recordedBy ? <Fact label="Recorded by" value={recordedBy} /> : null}
        <Fact
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
        {notes ? <Fact label="Notes" value={notes} /> : null}
      </dl>
    </section>
  );
}
