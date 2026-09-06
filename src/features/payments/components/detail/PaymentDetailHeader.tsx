"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import type { Payment } from "@/features/payments/types/payment.types";
import {
  formatPaymentCustomer,
  formatPaymentDate,
  formatPaymentMethod,
} from "@/features/payments/utils/format-payment";

type PaymentDetailHeaderProps = {
  payment: Payment;
  actions?: ReactNode;
};

export function PaymentDetailHeader({ payment, actions }: PaymentDetailHeaderProps) {
  const paymentLabel = payment.name || `Payment #${payment.id}`;
  const customerName = formatPaymentCustomer(payment);
  const method = formatPaymentMethod(payment.payment_method);

  return (
    <DetailPageHeaderSection className="border-b-0 pb-3">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
              {payment.customer_uuid ? (
                <Link
                  href={ROUTES.customerDetail(payment.customer_uuid)}
                  className="hover:text-brand-primary hover:underline"
                >
                  {customerName}
                </Link>
              ) : (
                customerName
              )}
            </h1>
            <span className="font-mono text-xs font-medium text-brand-slate">
              {paymentLabel}
            </span>
            <PaymentStatusBadge state={payment.state} />
            {method !== "—" ? (
              <Badge variant="outline" className="gap-1 font-normal text-brand-slate">
                <AppIcon
                  name="creditCard"
                  size={12}
                  className="size-3 text-brand-primary"
                />
                {method}
              </Badge>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted">
            <span>Paid {formatPaymentDate(payment.payment_date)}</span>
          </div>
        </div>

        {actions ? <div className="ml-auto shrink-0">{actions}</div> : null}
      </div>
    </DetailPageHeaderSection>
  );
}
