"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
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
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  formatInsuranceMembership,
  formatInsuranceMemberType,
  isOrderCoverage,
  sortClientCoverage,
} from "@/features/sales-orders/utils/sales-order-client-coverage";
import {
  formatSalesOrderAmount,
  formatSalesOrderCurrency,
} from "@/features/sales-orders/utils/format-sales-order";
import { cn } from "@/lib/utils";

type SalesOrderDetailClientTabProps = {
  order: SalesOrder;
  isActive: boolean;
};

type ClientSnapshot = {
  customer: Customer;
  insurance: CustomerInsurance[];
  billing: CustomerBillingSummary | null;
};

function ClientTabSkeleton() {
  return (
    <div className="space-y-8" data-testid="sales-order-client-skeleton">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

function RecordSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
        {title}
      </h3>
      <div className="mt-3 divide-y divide-dash-border/60">{children}</div>
    </section>
  );
}

function RecordRow({
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

function buildIdentityMeta(customer: Customer): string {
  const parts = [
    customer.customer_identifier,
    customer.gender,
    formatAdaptiveAge(customer.dob),
  ];

  if (!customer.is_active) {
    parts.push("Inactive");
  }

  if (isCustomerVisitActive(customer.visit_status)) {
    parts.push("In clinic");
  }

  return parts.filter(Boolean).join(" · ");
}

function parseAmount(value: number | string | null | undefined): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export function SalesOrderDetailClientTab({
  order,
  isActive,
}: SalesOrderDetailClientTabProps) {
  const customerUuid = order.customer_uuid?.trim() || null;
  const [snapshot, setSnapshot] = useState<ClientSnapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive || !customerUuid) {
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
  }, [isActive, customerUuid]);

  if (!isActive) {
    return null;
  }

  if (!customerUuid) {
    return (
      <CustomerDetailTabEmptyState
        icon={UserRound}
        title="No client linked"
        description={
          order.customer_name
            ? `${order.customer_name} is listed on this order, but the client profile could not be opened.`
            : "This order is not linked to a client profile."
        }
        data-testid="sales-order-client-empty-state"
      />
    );
  }

  const displayed =
    snapshot?.customer.uuid === customerUuid ? snapshot : null;

  if (loadError && !displayed) {
    return (
      <CustomerDetailTabEmptyState
        icon={UserRound}
        title="Client unavailable"
        description={
          loadError ??
          "The linked client could not be loaded. The record may have been removed or you may not have access."
        }
        data-testid="sales-order-client-unavailable-state"
      />
    );
  }

  if (!displayed) {
    return <ClientTabSkeleton />;
  }

  const { customer, insurance, billing } = displayed;
  const fullName = formatCustomerName(customer);
  const phone = customer.phone_number?.trim() || "";
  const email = customer.email?.trim() || "";
  const coverage = sortClientCoverage(insurance, order);
  const currency = formatSalesOrderCurrency(order) ?? "MWK";
  const outstanding = billing ? parseAmount(billing.totals.total_due) : 0;

  return (
    <div className="space-y-8" data-testid="sales-order-client-tab">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-brand-navy">
            {fullName}
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            {buildIdentityMeta(customer)}
          </p>
        </div>
        <SecondaryButton asChild className="shrink-0">
          <Link href={ROUTES.customerDetail(customer.uuid)}>View client</Link>
        </SecondaryButton>
      </div>

      {phone || email ? (
        <RecordSection title="Contact">
          {phone ? (
            <RecordRow
              label="Phone"
              value={
                <a
                  href={`tel:${phone}`}
                  className="underline-offset-4 hover:underline"
                >
                  {phone}
                </a>
              }
            />
          ) : null}
          {email ? (
            <RecordRow
              label="Email"
              value={
                <a
                  href={`mailto:${email}`}
                  className="break-all underline-offset-4 hover:underline"
                >
                  {email}
                </a>
              }
            />
          ) : null}
        </RecordSection>
      ) : null}

      <RecordSection title="Coverage">
        {coverage.length === 0 ? (
          <p className="text-sm text-brand-muted">No insurance on file.</p>
        ) : (
          coverage.map((record) => {
            const onThisOrder = isOrderCoverage(record, order);
            const details = [
              formatInsuranceMembership(record),
              formatInsuranceMemberType(record),
              record.is_primary ? "Primary" : null,
              record.is_active ? null : "Inactive",
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <div
                key={record.uuid}
                className="flex items-start justify-between gap-4 py-2.5 first:pt-0"
              >
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium text-brand-navy",
                      !record.is_active && "text-brand-muted",
                    )}
                  >
                    {record.insurance_company_name} · {record.scheme_name}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-brand-muted">
                    {details}
                  </p>
                </div>
                {onThisOrder ? (
                  <p className="shrink-0 text-xs font-medium text-brand-navy">
                    On this order
                  </p>
                ) : null}
              </div>
            );
          })
        )}
      </RecordSection>

      {billing ? (
        <RecordSection title="Account">
          <RecordRow
            label="Outstanding"
            value={
              <span
                className={
                  outstanding > 0 ? "font-medium text-red-600" : undefined
                }
              >
                {formatSalesOrderAmount(billing.totals.total_due, currency)}
              </span>
            }
          />
          <RecordRow
            label="Paid"
            value={formatSalesOrderAmount(billing.totals.total_paid, currency)}
          />
        </RecordSection>
      ) : null}
    </div>
  );
}
