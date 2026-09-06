"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { fetchCustomerBillingSummary } from "@/features/customers/services/customer-billing.service";
import { fetchCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
import { fetchCustomer } from "@/features/customers/services/customers.service";
import type { CustomerBillingSummary } from "@/features/customers/types/customer-billing.types";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { isCustomerVisitActive } from "@/features/customers/utils/customer-visit-status";
import {
  formatAdaptiveAge,
  formatCustomerName,
} from "@/features/customers/utils/format-customer";
import type { Payment } from "@/features/payments/types/payment.types";
import { formatPaymentAmount } from "@/features/payments/utils/format-payment";
import { sortClientCoverage } from "@/features/sales-orders/utils/sales-order-client-coverage";

type PaymentDetailClientSectionProps = {
  payment: Payment;
};

type ClientSnapshot = {
  customer: Customer;
  insurance: CustomerInsurance[];
  billing: CustomerBillingSummary | null;
};

function ClientSectionSkeleton() {
  return (
    <div className="space-y-3" data-testid="payment-client-skeleton">
      <Skeleton className="h-3 w-14" />
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-4 w-44" />
    </div>
  );
}

function IdentityPills({ customer }: { customer: Customer }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {customer.customer_identifier ? (
        <Badge variant="outline" className="font-mono font-normal">
          {customer.customer_identifier}
        </Badge>
      ) : null}
      {customer.gender ? (
        <Badge variant="secondary" className="font-normal">
          {customer.gender}
        </Badge>
      ) : null}
      <Badge variant="outline" className="font-normal">
        {formatAdaptiveAge(customer.dob)}
      </Badge>
      {!customer.is_active ? (
        <Badge variant="destructive" className="font-normal">
          Inactive
        </Badge>
      ) : null}
      {isCustomerVisitActive(customer.visit_status) ? (
        <Badge variant="success" className="font-normal">
          In clinic
        </Badge>
      ) : null}
    </div>
  );
}

function parseAmount(value: number | string | null | undefined): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export function PaymentDetailClientSection({
  payment,
}: PaymentDetailClientSectionProps) {
  const customerUuid = payment.customer_uuid?.trim() || null;
  const [snapshot, setSnapshot] = useState<ClientSnapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerUuid) {
      return;
    }

    let cancelled = false;

    async function loadClient() {
      const [customerResult, insuranceResult, billingResult] =
        await Promise.allSettled([
          fetchCustomer(customerUuid),
          fetchCustomerInsurance(customerUuid),
          fetchCustomerBillingSummary(customerUuid),
        ]);

      if (cancelled) {
        return;
      }

      if (customerResult.status === "rejected") {
        setSnapshot(null);
        setLoadError(
          customerResult.reason instanceof Error
            ? customerResult.reason.message
            : "Failed to load client details.",
        );
        return;
      }

      setSnapshot({
        customer: customerResult.value,
        insurance:
          insuranceResult.status === "fulfilled" ? insuranceResult.value : [],
        billing:
          billingResult.status === "fulfilled" ? billingResult.value : null,
      });
      setLoadError(null);
    }

    void loadClient();

    return () => {
      cancelled = true;
    };
  }, [customerUuid]);

  if (!customerUuid) {
    return (
      <div data-testid="payment-client-empty-state">
        <p className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
          Client
        </p>
        <p className="mt-2 text-sm text-brand-muted">
          {payment.customer_name
            ? `${payment.customer_name} is listed on this payment, but the client profile could not be opened.`
            : "This payment is not linked to a client profile."}
        </p>
      </div>
    );
  }

  const displayed =
    snapshot?.customer.uuid === customerUuid ? snapshot : null;

  if (loadError && !displayed) {
    return (
      <div data-testid="payment-client-unavailable-state">
        <p className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
          Client
        </p>
        <p className="mt-2 text-sm text-brand-muted">
          {loadError || "The linked client could not be loaded."}
        </p>
      </div>
    );
  }

  if (!displayed) {
    return <ClientSectionSkeleton />;
  }

  const { customer, insurance, billing } = displayed;
  const fullName = formatCustomerName(customer);
  const phone = customer.phone_number?.trim() || "";
  const email = customer.email?.trim() || "";
  const coverage = sortClientCoverage(insurance, {});
  const primaryCover = coverage[0];
  const outstanding = billing ? parseAmount(billing.totals.total_due) : 0;
  const contact = [phone, email].filter(Boolean);

  return (
    <div data-testid="payment-detail-client-tab">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
          Client
        </p>
        <Link
          href={ROUTES.customerDetail(customer.uuid)}
          className="text-sm font-medium text-brand-primary hover:underline"
        >
          View client
        </Link>
      </div>

      <h2 className="mt-2 truncate text-base font-semibold text-brand-navy">
        {fullName}
      </h2>
      <IdentityPills customer={customer} />

      {contact.length > 0 ? (
        <p className="mt-3 text-sm text-brand-slate">
          {phone ? (
            <a href={`tel:${phone}`} className="hover:underline">
              {phone}
            </a>
          ) : null}
          {phone && email ? (
            <span className="text-brand-border"> · </span>
          ) : null}
          {email ? (
            <a href={`mailto:${email}`} className="break-all hover:underline">
              {email}
            </a>
          ) : null}
        </p>
      ) : null}

      {primaryCover ? (
        <p
          className={
            primaryCover.is_active
              ? "mt-3 text-sm text-brand-navy"
              : "mt-3 text-sm text-brand-muted"
          }
        >
          {primaryCover.insurance_company_name} · {primaryCover.scheme_name}
        </p>
      ) : (
        <p className="mt-3 text-sm text-brand-muted">No insurance on file.</p>
      )}

      {billing ? (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <Badge
            variant={outstanding > 0 ? "destructive" : "success"}
            className="font-normal tabular-nums"
          >
            Outstanding {formatPaymentAmount(billing.totals.total_due)}
          </Badge>
          <Badge variant="secondary" className="font-normal tabular-nums">
            Paid {formatPaymentAmount(billing.totals.total_paid)}
          </Badge>
        </div>
      ) : null}
    </div>
  );
}
