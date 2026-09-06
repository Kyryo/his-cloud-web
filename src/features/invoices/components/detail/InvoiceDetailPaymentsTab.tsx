"use client";

import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { InvoiceDetailTabPanel } from "@/features/invoices/components/detail/InvoiceDetailTabPanel";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import { fetchPayments } from "@/features/payments/services/payments.service";
import type { Payment, PaymentState } from "@/features/payments/types/payment.types";
import { formatPaymentMethod } from "@/features/payments/utils/format-payment";
import { ROUTES } from "@/constants/routes";

const PAYMENTS_PAGE_SIZE = 20;

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
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load more payments.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <InvoiceDetailTabPanel
      isActive={isActive}
      data-testid="invoice-detail-payments-tab"
      title="Payments"
      description={
        totalCount > 0
          ? `${totalCount} payment${totalCount === 1 ? "" : "s"} recorded against this invoice.`
          : "Payments applied to this invoice."
      }
      action={
        totalCount > 0 ? (
          <div className="flex items-center gap-1.5 text-xs text-brand-muted">
            <span>Collected:</span>
            <span className="font-semibold tabular-nums text-emerald-700">
              {formatInvoiceAmount(invoice.amount_paid)}
            </span>
          </div>
        ) : null
      }
    >
      {isLoading ? (
        <CustomerTabSkeleton statCards={0} rows={5} />
      ) : loadError && payments.length === 0 ? (
        <p className="text-sm text-red-700">{loadError}</p>
      ) : payments.length === 0 ? (
        <CustomerDetailTabEmptyState
          icon={Wallet}
          title="No payments yet"
          description="Payments recorded against this invoice will appear here."
          data-testid="invoice-payments-empty-state"
        />
      ) : (
        <>
          <ul
            className="divide-y divide-dash-border/60"
            data-testid="invoice-payments-list"
          >
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="flex items-start justify-between gap-3 py-3.5 first:pt-0"
                data-testid={`invoice-payment-${payment.id}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(ROUTES.paymentDetail(payment.id))}
                      className="text-left text-sm font-medium text-brand-navy hover:text-brand-primary"
                    >
                      {payment.name}
                    </button>
                    <PaymentStatusBadge state={payment.state as PaymentState} />
                    {payment.payment_method ? (
                      <Badge variant="outline" className="font-normal text-xs">
                        {formatPaymentMethod(payment.payment_method)}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-brand-muted">
                    {formatDisplayDateTime(payment.payment_date ?? "")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <p className="text-sm font-bold tabular-nums text-brand-navy">
                    {formatInvoiceAmount(payment.amount)}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-brand-primary hover:text-brand-primary-hover"
                    onClick={() => router.push(ROUTES.paymentDetail(payment.id))}
                  >
                    View
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {hasNext ? (
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoadingMore}
                onClick={() => void loadMorePayments()}
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </InvoiceDetailTabPanel>
  );
}
