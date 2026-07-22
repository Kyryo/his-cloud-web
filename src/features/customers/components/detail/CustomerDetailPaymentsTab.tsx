"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CustomerInvoicePaymentStatsCards } from "@/features/customers/components/detail/CustomerInvoicePaymentStatsCards";
import {
  CustomerDetailRecordList,
  CustomerDetailRecordListItem,
} from "@/features/customers/components/detail/CustomerDetailRecordList";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import { fetchCustomerPayments } from "@/features/customers/services/customer-billing.service";
import type {
  CustomerInvoicesStats,
  CustomerPaymentRecord,
} from "@/features/customers/types/customer-billing.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import type { PaymentState } from "@/features/payments/types/payment.types";
import { ROUTES } from "@/constants/routes";

const PAYMENTS_PAGE_SIZE = 20;

type CustomerDetailPaymentsTabProps = {
  customer: Customer;
  isActive: boolean;
};

export function CustomerDetailPaymentsTab({
  customer,
  isActive,
}: CustomerDetailPaymentsTabProps) {
  const router = useRouter();
  const [payments, setPayments] = useState<CustomerPaymentRecord[]>([]);
  const [invoicesStats, setInvoicesStats] = useState<CustomerInvoicesStats | null>(
    null,
  );
  const [hasNext, setHasNext] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadPayments = useCallback(
    async (nextOffset = 0, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const response = await fetchCustomerPayments(customer.uuid, {
          limit: PAYMENTS_PAGE_SIZE,
          offset: nextOffset,
        });

        setPayments((current) =>
          append ? [...current, ...response.payments] : response.payments,
        );
        setInvoicesStats(response.invoicesStats);
        setHasNext(response.pagination.has_next);
        setOffset(nextOffset);
        setHasLoaded(true);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Failed to load payments.",
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [customer.uuid],
  );

  useEffect(() => {
    if (!isActive || hasLoaded) {
      return;
    }
    void loadPayments(0, false);
  }, [hasLoaded, isActive, loadPayments]);

  if (!isActive) {
    return null;
  }

  if (isLoading && !hasLoaded) {
    return <CustomerTabSkeleton statCards={4} rows={5} />;
  }

  if (loadError && !hasLoaded) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
          {loadError}
        </div>
        <Button type="button" variant="outline" onClick={() => void loadPayments(0, false)}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="customer-detail-payments-tab">
      <CustomerInvoicePaymentStatsCards stats={invoicesStats} />

      {payments.length === 0 ? (
        <CustomerDetailTabEmptyState
          icon={Wallet}
          title="No payments yet"
          description="Payments recorded for this client will appear here."
          data-testid="customer-payments-empty-state"
        />
      ) : (
        <CustomerDetailRecordList
          title="Payments"
          description="Payments linked to this client."
          data-testid="customer-payments-list"
          footer={
            hasNext ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoadingMore}
                onClick={() => void loadPayments(offset + PAYMENTS_PAGE_SIZE, true)}
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </Button>
            ) : null
          }
        >
          {payments.map((payment) => (
            <CustomerDetailRecordListItem
              key={payment.id}
              compact
              title={payment.name}
              badges={<PaymentStatusBadge state={payment.state as PaymentState} />}
              description={[
                formatInvoiceAmount(payment.amount),
                payment.applies_to_opening_balance
                  ? "Opening balance"
                  : payment.invoice_name || null,
                payment.payment_method,
              ]
                .filter(Boolean)
                .join(" · ")}
              dateTime={formatDisplayDateTime(payment.payment_date)}
              onUpdate={() => router.push(ROUTES.paymentDetail(payment.id))}
              updateLabel="View payment"
              data-testid={`customer-payment-${payment.id}`}
            />
          ))}
        </CustomerDetailRecordList>
      )}
    </div>
  );
}
