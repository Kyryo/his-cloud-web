"use client";

import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import {
  CustomerDetailRecordList,
  CustomerDetailRecordListItem,
} from "@/features/customers/components/detail/CustomerDetailRecordList";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import { fetchPayments } from "@/features/payments/services/payments.service";
import type { Payment, PaymentState } from "@/features/payments/types/payment.types";
import { formatPaymentMethod } from "@/features/payments/utils/format-payment";
import { ROUTES } from "@/constants/routes";
import { formatCompactNumber } from "@/utils/format-compact-number";
import { cn } from "@/lib/utils";

const PAYMENTS_PAGE_SIZE = 20;
const STAT_CARD_CLASS = "border-brand-border bg-white shadow-none";

type InvoiceDetailPaymentsTabProps = {
  invoice: Invoice;
  isActive: boolean;
};

export function InvoiceDetailPaymentsTab({
  invoice,
  isActive,
}: InvoiceDetailPaymentsTabProps) {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setLoadError(null);
      setPage(1);

      try {
        const response = await fetchPayments({
          invoiceId: invoice.id,
          page: 1,
          pageSize: PAYMENTS_PAGE_SIZE,
        });
        if (cancelled) {
          return;
        }

        setPayments(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
        setHasNext(
          (response.pagination?.count ?? response.results.length) >
            response.results.length,
        );
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load payments.",
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
  }, [invoice.amount_paid, invoice.id, isActive]);

  async function loadMorePayments() {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    setLoadError(null);

    try {
      const response = await fetchPayments({
        invoiceId: invoice.id,
        page: nextPage,
        pageSize: PAYMENTS_PAGE_SIZE,
      });
      const nextPayments = [...payments, ...response.results];
      setPayments(nextPayments);
      const count = response.pagination?.count ?? nextPayments.length;
      setTotalCount(count);
      setHasNext(count > nextPayments.length);
      setPage(nextPage);
      setPage(nextPage);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load more payments.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <div
      className={cn(!isActive && "hidden")}
      data-testid="invoice-detail-payments-tab"
    >
      {isLoading ? (
        <CustomerTabSkeleton statCards={2} rows={5} />
      ) : loadError && payments.length === 0 ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
            {loadError}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <StatsCard1Grid>
            <StatsCard1
              className={STAT_CARD_CLASS}
              title="Payments recorded"
              value={formatCompactNumber(totalCount)}
            />
            <StatsCard1
              className={STAT_CARD_CLASS}
              title="Amount paid"
              value={formatInvoiceAmount(invoice.amount_paid)}
            />
          </StatsCard1Grid>

          {payments.length === 0 ? (
            <CustomerDetailTabEmptyState
              icon={Wallet}
              title="No payments yet"
              description="Payments recorded against this invoice will appear here."
              data-testid="invoice-payments-empty-state"
            />
          ) : (
            <CustomerDetailRecordList
              title="Payments"
              description="Payments applied to this invoice."
              data-testid="invoice-payments-list"
              footer={
                hasNext ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoadingMore}
                    onClick={() => void loadMorePayments()}
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
                    formatPaymentMethod(payment.payment_method),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  dateTime={formatDisplayDateTime(payment.payment_date ?? "")}
                  onUpdate={() => router.push(ROUTES.paymentDetail(payment.id))}
                  updateLabel="View payment"
                  data-testid={`invoice-payment-${payment.id}`}
                />
              ))}
            </CustomerDetailRecordList>
          )}
        </div>
      )}
    </div>
  );
}
