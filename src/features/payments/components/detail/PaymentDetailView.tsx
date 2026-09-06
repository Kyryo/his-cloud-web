"use client";

import Link from "next/link";
import { ArrowUpRight, CreditCard } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { PaymentDetailClientSection } from "@/features/payments/components/detail/PaymentDetailClientSection";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import type { Payment } from "@/features/payments/types/payment.types";
import {
  formatPaymentAllocationLabel,
  formatPaymentDay,
  formatPaymentMethod,
  formatPaymentRecordedBy,
  getPaymentAllocationHref,
} from "@/features/payments/utils/format-payment";
import { formatAmountNumber } from "@/features/sales-orders/utils/format-sales-order";
import { cn } from "@/lib/utils";

type PaymentDetailViewProps = {
  payment: Payment;
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

export function PaymentDetailView({ payment }: PaymentDetailViewProps) {
  const method = formatPaymentMethod(payment.payment_method);
  const allocationLabel = formatPaymentAllocationLabel(payment);
  const allocationHref = getPaymentAllocationHref(payment);
  const recordedBy = formatPaymentRecordedBy(payment);
  const notes = payment.note?.trim() || "";
  const state = String(payment.state || "").toLowerCase();
  const isCancelled = state === "cancel";

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8" data-testid="payment-detail-view">
      <section className="border-b border-dash-border/80 pb-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-muted">
          Received
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              className={cn(
                "text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl",
                isCancelled
                  ? "text-red-600 line-through decoration-red-300"
                  : state === "posted"
                    ? "text-emerald-800"
                    : "text-brand-navy",
              )}
              data-testid="payment-receipt-amount"
            >
              {formatAmountNumber(payment.amount)}
            </p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-brand-muted">
              MWK
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <PaymentStatusBadge state={payment.state} />
            {method !== "—" ? (
              <Badge variant="outline" className="gap-1 font-normal text-brand-slate">
                <CreditCard className="size-3 text-brand-primary" aria-hidden="true" />
                {method}
              </Badge>
            ) : null}
          </div>
        </div>
        {isCancelled ? (
          <p className="mt-3 text-sm text-red-700">This receipt was cancelled.</p>
        ) : null}
      </section>

      <div className="grid gap-8 pt-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        <section>
          <p className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
            Toward
          </p>
          {allocationHref ? (
            <Link
              href={allocationHref}
              className="mt-2 inline-flex items-center gap-1.5 text-lg font-semibold text-brand-navy hover:text-brand-primary"
            >
              {allocationLabel}
              <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          ) : (
            <p className="mt-2 text-lg font-semibold text-brand-navy">
              {allocationLabel}
            </p>
          )}

          <dl className="mt-5 divide-y divide-dash-border/60">
            <Fact label="Paid" value={formatPaymentDay(payment.payment_date)} />
            {recordedBy ? <Fact label="Recorded by" value={recordedBy} /> : null}
            <Fact
              label="Reference"
              value={
                <span className="font-mono text-xs">
                  {payment.name || `#${payment.id}`}
                </span>
              }
            />
          </dl>

          {notes ? (
            <p className="mt-5 text-sm leading-relaxed text-brand-slate">{notes}</p>
          ) : null}
        </section>

        <aside className="lg:border-l lg:border-dash-border/80 lg:pl-8">
          <PaymentDetailClientSection payment={payment} />
        </aside>
      </div>
    </div>
  );
}
