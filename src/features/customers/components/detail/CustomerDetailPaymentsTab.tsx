"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ListPagePagination } from "@/features/app-shell/components/page-layout";
import { CustomerInvoicePaymentStatsCards } from "@/features/customers/components/detail/CustomerInvoicePaymentStatsCards";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerPaymentsTable } from "@/features/customers/components/detail/CustomerPaymentsTable";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import { fetchCustomerPayments } from "@/features/customers/services/customer-billing.service";
import type {
  CustomerInvoicesStats,
  CustomerPaymentRecord,
} from "@/features/customers/types/customer-billing.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { pageOffset } from "@/features/customers/utils/paginate-items";
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
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const hasLoadedRef = useRef(false);

  const loadPayments = useCallback(async (nextPage: number) => {
    if (hasLoadedRef.current) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setLoadError(null);

    try {
      const response = await fetchCustomerPayments(customer.uuid, {
        limit: PAYMENTS_PAGE_SIZE,
        offset: pageOffset(nextPage, PAYMENTS_PAGE_SIZE),
      });

      setPayments(response.payments);
      setInvoicesStats(response.invoicesStats);
      setTotalCount(response.pagination.count);
      setHasNext(response.pagination.has_next);
      setHasPrevious(response.pagination.has_previous ?? nextPage > 1);
      hasLoadedRef.current = true;
      setHasLoaded(true);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load payments.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [customer.uuid]);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    void loadPayments(page);
  }, [isActive, loadPayments, page]);

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
        <Button type="button" variant="outline" onClick={() => void loadPayments(1)}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="customer-detail-payments-tab">
      <CustomerInvoicePaymentStatsCards stats={invoicesStats} />

      {totalCount === 0 ? (
        <CustomerDetailTabEmptyState
          icon={Wallet}
          title="No payments yet"
          description="Payments recorded for this client will appear here."
          data-testid="customer-payments-empty-state"
        />
      ) : (
        <>
          <CustomerPaymentsTable
            payments={payments}
            onRowClick={(payment) => router.push(ROUTES.paymentDetail(payment.id))}
          />
          <ListPagePagination
            page={page}
            pageSize={PAYMENTS_PAGE_SIZE}
            totalCount={totalCount}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            isLoading={isRefreshing}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
