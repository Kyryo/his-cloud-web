"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
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
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import {
  formatInsuranceMembership,
  formatInsuranceMemberType,
  isOrderCoverage,
  sortClientCoverage,
} from "@/features/sales-orders/utils/sales-order-client-coverage";
import { cn } from "@/lib/utils";

type InvoiceDetailClientTabProps = {
  invoice: Invoice;
  isActive: boolean;
};

type ClientSnapshot = {
  customer: Customer;
  insurance: CustomerInsurance[];
  billing: CustomerBillingSummary | null;
};

function ClientTabSkeleton() {
  return (
    <div className="space-y-8" data-testid="invoice-client-skeleton">
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

export function InvoiceDetailClientTab({
  invoice,
  isActive,
}: InvoiceDetailClientTabProps) {
  const customerUuid = invoice.customer_uuid?.trim() || null;
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
          invoice.customer_name
            ? `${invoice.customer_name} is listed on this invoice, but the client profile could not be opened.`
            : "This invoice is not linked to a client profile."
        }
        data-testid="invoice-client-empty-state"
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
        data-testid="invoice-client-unavailable-state"
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
  const coverage = sortClientCoverage(insurance, invoice);
  const outstanding = billing ? parseAmount(billing.totals.total_due) : 0;

  return (
    <div className="space-y-8" data-testid="invoice-detail-client-tab">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-brand-navy">
            {fullName}
          </h2>
          <IdentityPills customer={customer} />
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
            const onThisInvoice = isOrderCoverage(record, invoice);
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
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="font-mono font-normal">
                      {formatInsuranceMembership(record)}
                    </Badge>
                    <Badge variant="secondary" className="font-normal">
                      {formatInsuranceMemberType(record)}
                    </Badge>
                    {record.is_primary ? (
                      <Badge variant="secondary" className="font-normal">
                        Primary
                      </Badge>
                    ) : null}
                    {!record.is_active ? (
                      <Badge variant="destructive" className="font-normal">
                        Inactive
                      </Badge>
                    ) : null}
                    {onThisInvoice ? (
                      <Badge variant="success" className="font-normal">
                        On this invoice
                      </Badge>
                    ) : null}
                  </div>
                </div>
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
              <Badge
                variant={outstanding > 0 ? "destructive" : "success"}
                className="font-normal tabular-nums"
              >
                {formatInvoiceAmount(billing.totals.total_due)}
              </Badge>
            }
          />
          <RecordRow
            label="Paid"
            value={
              <Badge variant="secondary" className="font-normal tabular-nums">
                {formatInvoiceAmount(billing.totals.total_paid)}
              </Badge>
            }
          />
        </RecordSection>
      ) : null}
    </div>
  );
}
