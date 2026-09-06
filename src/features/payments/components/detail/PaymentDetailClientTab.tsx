"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { SecondaryButton } from "@/components/ui/app-buttons";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { fetchCustomer } from "@/features/customers/services/customers.service";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatCustomerVisitStatusLabel } from "@/features/customers/utils/customer-visit-status";
import {
  formatAdaptiveAge,
  formatCustomerName,
} from "@/features/customers/utils/format-customer";
import type { Payment } from "@/features/payments/types/payment.types";
import { formatPaymentCustomer } from "@/features/payments/utils/format-payment";
import { cn } from "@/lib/utils";

type PaymentDetailClientTabProps = {
  payment: Payment;
  isActive: boolean;
};

function ClientTabSkeleton() {
  return (
    <div className="space-y-8" data-testid="payment-client-skeleton">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      <Skeleton className="h-24 w-full" />
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

export function PaymentDetailClientTab({
  payment,
  isActive,
}: PaymentDetailClientTabProps) {
  const customerUuid = payment.customer_uuid?.trim() || null;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive || !customerUuid) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const record = await fetchCustomer(customerUuid);
        if (!cancelled) {
          setCustomer(record);
          setLoadError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setCustomer(null);
          setLoadError(
            error instanceof Error ? error.message : "Failed to load client details.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [customerUuid, isActive]);

  const displayed =
    customer && customer.uuid === customerUuid ? customer : null;

  return (
    <div
      className={cn(!isActive && "hidden")}
      data-testid="payment-detail-client-tab"
    >
      {!customerUuid ? (
        <div className="space-y-6">
          <RecordSection title="Listed on this payment">
            <RecordRow label="Client" value={formatPaymentCustomer(payment)} />
            <RecordRow
              label="Client ID"
              value={payment.customer_id ? String(payment.customer_id) : "—"}
            />
          </RecordSection>
          <CustomerDetailTabEmptyState
            icon={UserRound}
            title="Client profile unavailable"
            description="The full client profile could not be loaded for this payment."
            data-testid="payment-client-empty-state"
          />
        </div>
      ) : loadError && !displayed ? (
        <CustomerDetailTabEmptyState
          icon={UserRound}
          title="Client unavailable"
          description={
            loadError ??
            "The linked client could not be loaded. The record may have been removed or you may not have access."
          }
          data-testid="payment-client-unavailable-state"
        />
      ) : !displayed ? (
        <ClientTabSkeleton />
      ) : (
        <div className="space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-brand-navy">
                {formatCustomerName(displayed)}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {displayed.customer_identifier ? (
                  <Badge variant="outline" className="font-mono font-normal">
                    {displayed.customer_identifier}
                  </Badge>
                ) : null}
                {displayed.gender ? (
                  <Badge variant="secondary" className="font-normal">
                    {displayed.gender}
                  </Badge>
                ) : null}
                {!displayed.is_active ? (
                  <Badge variant="outline" className="font-normal">
                    Inactive
                  </Badge>
                ) : null}
              </div>
            </div>
            <SecondaryButton asChild className="shrink-0">
              <Link href={ROUTES.customerDetail(displayed.uuid)}>View client</Link>
            </SecondaryButton>
          </div>

          <RecordSection title="Contact">
            <RecordRow label="Age" value={formatAdaptiveAge(displayed.dob)} />
            <RecordRow
              label="Phone"
              value={
                displayed.phone_number ? (
                  <a
                    href={`tel:${displayed.phone_number}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {displayed.phone_number}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <RecordRow
              label="Email"
              value={
                displayed.email ? (
                  <a
                    href={`mailto:${displayed.email}`}
                    className="break-all underline-offset-4 hover:underline"
                  >
                    {displayed.email}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <RecordRow
              label="Visit status"
              value={formatCustomerVisitStatusLabel(displayed.visit_status)}
            />
          </RecordSection>
        </div>
      )}
    </div>
  );
}
