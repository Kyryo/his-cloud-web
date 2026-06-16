"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { ClientAvatar } from "@/components/client-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import { fetchCustomer } from "@/features/customers/services/customers.service";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  formatAdaptiveAge,
  formatCustomerName,
} from "@/features/customers/utils/format-customer";
import { formatCustomerVisitStatusLabel } from "@/features/customers/utils/customer-visit-status";
import type { Payment } from "@/features/payments/types/payment.types";
import { formatPaymentCustomer } from "@/features/payments/utils/format-payment";
import { SalesOrderLinkedDetailsTable } from "@/features/sales-orders/components/detail/SalesOrderLinkedDetailsTable";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type PaymentDetailClientTabProps = {
  payment: Payment;
  isActive: boolean;
};

export function PaymentDetailClientTab({
  payment,
  isActive,
}: PaymentDetailClientTabProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const customerUuid = payment.customer_uuid?.trim();
    if (!customerUuid) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const record = await fetchCustomer(customerUuid);
        if (!cancelled) {
          setCustomer(record);
        }
      } catch (error) {
        if (!cancelled) {
          setCustomer(null);
          setLoadError(
            error instanceof Error ? error.message : "Failed to load client details.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [payment.customer_uuid, isActive]);

  const customerUuid = payment.customer_uuid?.trim();

  return (
    <div
      className={cn(!isActive && "hidden")}
      data-testid="payment-detail-client-tab"
    >
      {!customerUuid ? (
        <div className="space-y-4">
          <SalesOrderLinkedDetailsTable
            rows={[
              { label: "Client", value: formatPaymentCustomer(payment) },
              {
                label: "Client ID",
                value: payment.customer_id ? String(payment.customer_id) : "—",
              },
            ]}
          />
          <CustomerDetailTabEmptyState
            icon={UserRound}
            title="Client profile unavailable"
            description="The full client profile could not be loaded for this payment."
            data-testid="payment-client-empty-state"
          />
        </div>
      ) : isLoading || (!customer && !loadError) ? (
        <CustomerTabSkeleton rows={4} />
      ) : loadError || !customer ? (
        <CustomerDetailTabEmptyState
          icon={UserRound}
          title="Client unavailable"
          description={
            loadError ??
            "The linked client could not be loaded. The record may have been removed or you may not have access."
          }
          data-testid="payment-client-unavailable-state"
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl border border-brand-border bg-white p-5">
            <ClientAvatar name={formatCustomerName(customer)} className="size-12 text-sm" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-base font-semibold text-brand-navy">
                  {formatCustomerName(customer)}
                </h2>
                <Badge variant="secondary" className="font-normal">
                  {customer.gender}
                </Badge>
                {!customer.is_active ? (
                  <Badge variant="outline" className="font-normal">
                    Inactive
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 font-mono text-xs text-brand-muted">
                {customer.customer_identifier}
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href={ROUTES.customerDetail(customer.uuid)}>View client</Link>
            </Button>
          </div>

          <SalesOrderLinkedDetailsTable
            rows={[
              { label: "Age", value: formatAdaptiveAge(customer.dob) },
              { label: "Phone", value: customer.phone_number || "—" },
              { label: "Email", value: customer.email || "—" },
              {
                label: "Visit status",
                value: formatCustomerVisitStatusLabel(customer.visit_status),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
