"use client";

import Link from "next/link";

import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import type { Payment } from "@/features/payments/types/payment.types";
import {
  formatPaymentAmount,
  formatPaymentCustomer,
  formatPaymentDate,
  formatPaymentMethod,
} from "@/features/payments/utils/format-payment";
import { SalesOrderLinkedDetailsTable } from "@/features/sales-orders/components/detail/SalesOrderLinkedDetailsTable";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type PaymentDetailOverviewTabProps = {
  payment: Payment;
  isActive: boolean;
};

export function PaymentDetailOverviewTab({
  payment,
  isActive,
}: PaymentDetailOverviewTabProps) {
  return (
    <section
      className={cn(!isActive && "hidden")}
      data-testid="payment-detail-overview-tab"
    >
      <div className="rounded-xl border border-brand-border bg-white">
        <div className="border-b border-brand-border px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-brand-navy">Payment details</h3>
            <PaymentStatusBadge state={payment.state} />
          </div>
          <p className="mt-0.5 text-xs text-brand-muted">
            Reference, amount, and linked invoice for this payment.
          </p>
        </div>
        <div className="p-4">
          <SalesOrderLinkedDetailsTable
            rows={[
              { label: "Reference", value: payment.name || `#${payment.id}` },
              { label: "Client", value: formatPaymentCustomer(payment) },
              { label: "Amount", value: formatPaymentAmount(payment.amount) },
              { label: "Payment date", value: formatPaymentDate(payment.payment_date) },
              { label: "Method", value: formatPaymentMethod(payment.payment_method) },
              {
                label: "Notes",
                value: payment.note?.trim() ? payment.note : "—",
              },
              {
                label: "Invoice",
                value: payment.invoice_id ? (
                  <Link
                    href={ROUTES.invoiceDetail(payment.invoice_id)}
                    className="text-brand-primary hover:underline"
                  >
                    {payment.invoice_name || `#${payment.invoice_id}`}
                  </Link>
                ) : (
                  "—"
                ),
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
