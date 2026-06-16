"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { PaymentListToolbar } from "@/features/payments/components/PaymentListToolbar";
import { PaymentsPageHeader } from "@/features/payments/components/PaymentsPageHeader";
import {
  PaymentsPagination,
  PaymentsTable,
} from "@/features/payments/components/PaymentsTable";
import { fetchPayments } from "@/features/payments/services/payments.service";
import type { Payment } from "@/features/payments/types/payment.types";
import {
  buildPaymentListFilters,
  countActivePaymentFilters,
  DEFAULT_PAYMENT_LIST_FILTERS,
  type PaymentListFilterState,
} from "@/features/payments/utils/payment-list-filters";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";

const DEFAULT_PAGE_SIZE = 20;

export function PaymentsListPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filters, setFilters] = useState<PaymentListFilterState>(
    DEFAULT_PAYMENT_LIST_FILTERS,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listFilters = useMemo(
    () =>
      buildPaymentListFilters({
        search: activeSearch,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        filters,
      }),
    [activeSearch, filters, page],
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setError(null);
        const response = await fetchPayments(listFilters);
        if (cancelled) {
          return;
        }
        setPayments(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load payments.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [listFilters]);

  const handleSearchSubmit = useCallback(() => {
    setIsRefreshing(true);
    setActiveSearch(search.trim());
    setPage(1);
  }, [search]);

  const handleClearSearch = useCallback(() => {
    setIsRefreshing(true);
    setSearch("");
    setActiveSearch("");
    setPage(1);
  }, []);

  if (isLoading) {
    return <PageLoader message="Loading payments..." />;
  }

  const activeFilterCount = countActivePaymentFilters(filters);
  const hasActiveQuery = activeSearch.length > 0 || activeFilterCount > 0;
  const hasNoRecords = payments.length === 0 && totalCount === 0 && !hasActiveQuery;

  return (
    <ListPageLayout data-testid="payments-page">
      <PaymentsPageHeader
        search={search}
        isSearchDisabled={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <PaymentListToolbar
            search={search}
            filters={filters}
            isLoading={isRefreshing}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onClearSearch={handleClearSearch}
            onFiltersApply={(nextFilters) => {
              setIsRefreshing(true);
              setFilters(nextFilters);
              setPage(1);
            }}
          />
        </ListPageDataSectionsStack>
      ) : null}

      <ListPageTableSection>
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
            {error}
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
            <p className="text-sm font-medium text-brand-navy">No payments found</p>
            <p className="mt-2 text-sm text-brand-muted">
              {hasActiveQuery
                ? "Try adjusting your search or filters."
                : "Payments will appear here once they are recorded against invoices."}
            </p>
          </div>
        ) : (
          <>
            <PaymentsTable
              payments={payments}
              onRowClick={(payment) => router.push(ROUTES.paymentDetail(payment.id))}
            />
            <PaymentsPagination
              page={page}
              pageSize={DEFAULT_PAGE_SIZE}
              totalCount={totalCount}
              onPageChange={(nextPage) => {
                setIsRefreshing(true);
                setPage(nextPage);
              }}
            />
          </>
        )}
      </ListPageTableSection>
    </ListPageLayout>
  );
}
