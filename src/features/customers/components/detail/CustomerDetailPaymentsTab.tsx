"use client";

import { useCallback, useEffect, useState } from "react";
import { Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import {
  CustomerDetailRecordList,
  CustomerDetailRecordListItem,
} from "@/features/customers/components/detail/CustomerDetailRecordList";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import { fetchCustomerPayments } from "@/features/customers/services/customer-billing.service";
import type { CustomerPaymentRecord } from "@/features/customers/types/customer-billing.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import { formatCompactNumber } from "@/utils/format-compact-number";

const PAYMENTS_PAGE_SIZE = 20;
const STAT_CARD_CLASS = "border-brand-border bg-white shadow-none";

type CustomerDetailPaymentsTabProps = {
  customer: Customer;
  isActive: boolean;
};

export function CustomerDetailPaymentsTab({
  customer,
  isActive,
}: CustomerDetailPaymentsTabProps) {
  const [payments, setPayments] = useState<CustomerPaymentRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
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
        setTotalCount(response.pagination.count);
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
    return <CustomerTabSkeleton statCards={2} rows={5} />;
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
      <StatsCard1Grid>
        <StatsCard1
          className={STAT_CARD_CLASS}
          title="Total payments"
          value={formatCompactNumber(totalCount)}
        />
        <StatsCard1
          className={STAT_CARD_CLASS}
          title="Recorded"
          value={formatCompactNumber(payments.length)}
        />
      </StatsCard1Grid>

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
              description={[
                formatInvoiceAmount(payment.amount),
                payment.payment_method,
              ]
                .filter(Boolean)
                .join(" · ")}
              dateTime={formatDisplayDateTime(payment.payment_date)}
              data-testid={`customer-payment-${payment.id}`}
            />
          ))}
        </CustomerDetailRecordList>
      )}
    </div>
  );
}
