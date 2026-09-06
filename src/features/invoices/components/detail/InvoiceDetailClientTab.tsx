"use client";

import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { DetailClientProfile } from "@/features/customers/components/detail/DetailClientProfile";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { fetchCustomerBillingSummary } from "@/features/customers/services/customer-billing.service";
import { fetchCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
import { fetchCustomer } from "@/features/customers/services/customers.service";
import type { CustomerBillingSummary } from "@/features/customers/types/customer-billing.types";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import type { Customer } from "@/features/customers/types/customer.types";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import {
  formatInsuranceMembership,
  formatInsuranceMemberType,
  isOrderCoverage,
  sortClientCoverage,
} from "@/features/sales-orders/utils/sales-order-client-coverage";

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
    <div className="space-y-6" data-testid="invoice-client-skeleton">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Skeleton className="size-11 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      <div className="grid gap-4 border-t border-dash-border/80 pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
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
  const coverage = sortClientCoverage(insurance, invoice);
  const outstanding = billing ? parseAmount(billing.totals.total_due) : 0;

  return (
    <DetailClientProfile
      customer={customer}
      viewHref={ROUTES.customerDetail(customer.uuid)}
      data-testid="invoice-detail-client-tab"
      outstanding={
        billing ? formatInvoiceAmount(billing.totals.total_due) : undefined
      }
      paid={billing ? formatInvoiceAmount(billing.totals.total_paid) : undefined}
      hasOutstanding={outstanding > 0}
      coverage={coverage.map((record) => ({
        key: record.uuid,
        title: `${record.insurance_company_name} · ${record.scheme_name}`,
        membership: formatInsuranceMembership(record),
        details: [
          formatInsuranceMemberType(record),
          record.is_primary ? "Primary" : null,
          record.is_active ? null : "Inactive",
        ]
          .filter(Boolean)
          .join(" · "),
        isActive: record.is_active,
        onThisDocument: isOrderCoverage(record, invoice)
          ? "On this invoice"
          : null,
      }))}
    />
  );
}
