"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { ListPagePagination } from "@/features/app-shell/components/page-layout";
import { CustomerInvoicePaymentStatsCards } from "@/features/customers/components/detail/CustomerInvoicePaymentStatsCards";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerInvoicesTable } from "@/features/customers/components/detail/CustomerInvoicesTable";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import { fetchCustomerInvoices } from "@/features/customers/services/customer-billing.service";
import type {
  CustomerInvoiceRecord,
  CustomerInvoicesStats,
} from "@/features/customers/types/customer-billing.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { pageOffset } from "@/features/customers/utils/paginate-items";

const INVOICES_PAGE_SIZE = 20;

type CustomerDetailInvoicesTabProps = {
  customer: Customer;
  isActive: boolean;
};

export function CustomerDetailInvoicesTab({
  customer,
  isActive,
}: CustomerDetailInvoicesTabProps) {
  const router = useRouter();
  const [invoices, setInvoices] = useState<CustomerInvoiceRecord[]>([]);
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

  const loadInvoices = useCallback(async (nextPage: number) => {
    if (hasLoadedRef.current) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setLoadError(null);

    try {
      const response = await fetchCustomerInvoices(customer.uuid, {
        limit: INVOICES_PAGE_SIZE,
        offset: pageOffset(nextPage, INVOICES_PAGE_SIZE),
      });

      setInvoices(response.invoices);
      setInvoicesStats(response.invoicesStats);
      setTotalCount(response.pagination.count);
      setHasNext(response.pagination.has_next);
      setHasPrevious(response.pagination.has_previous ?? nextPage > 1);
      hasLoadedRef.current = true;
      setHasLoaded(true);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load invoices.",
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

    let cancelled = false;

    async function run() {
      try {
        const response = await fetchCustomerInvoices(customer.uuid, {
          limit: INVOICES_PAGE_SIZE,
          offset: pageOffset(page, INVOICES_PAGE_SIZE),
        });

        if (!cancelled) {
          setInvoices(response.invoices);
          setInvoicesStats(response.invoicesStats);
          setTotalCount(response.pagination.count);
          setHasNext(response.pagination.has_next);
          setHasPrevious(response.pagination.has_previous ?? page > 1);
          hasLoadedRef.current = true;
          setHasLoaded(true);
          setLoadError(null);
          setIsLoading(false);
          setIsRefreshing(false);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load invoices.",
          );
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [customer.uuid, isActive, page]);

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
        <Button type="button" variant="outline" onClick={() => void loadInvoices(1)}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="customer-detail-invoices-tab">
      <CustomerInvoicePaymentStatsCards stats={invoicesStats} />

      {totalCount === 0 ? (
        <CustomerDetailTabEmptyState
          icon={Receipt}
          title="No invoices yet"
          description="Invoices for this client will appear here once sales orders are converted."
          data-testid="customer-invoices-empty-state"
        />
      ) : (
        <>
          <CustomerInvoicesTable
            invoices={invoices}
            onRowClick={(invoice) => router.push(ROUTES.invoiceDetail(invoice.uuid))}
          />
          <ListPagePagination
            page={page}
            pageSize={INVOICES_PAGE_SIZE}
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
