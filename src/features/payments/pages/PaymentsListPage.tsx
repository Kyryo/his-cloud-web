"use client";

import { BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { FabButton } from "@/components/ui/fab-button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
  ListPagePagination,
  ListPageStatsSection,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { useListThenStats } from "@/features/app-shell/hooks/use-list-then-stats";
import { RecordOpeningBalancePaymentDialog } from "@/features/customers/components/detail/RecordOpeningBalancePaymentDialog";
import { fetchCustomerBillingSummary } from "@/features/customers/services/customer-billing.service";
import type { Customer } from "@/features/customers/types/customer.types";
import { PaymentsEmptyState } from "@/features/payments/components/PaymentsEmptyState";
import { PaymentSummaryStatsCards } from "@/features/payments/components/PaymentSummaryStatsCards";
import { PaymentsPageHeader } from "@/features/payments/components/PaymentsPageHeader";
import { PaymentsTable } from "@/features/payments/components/PaymentsTable";
import { PaymentsTableSkeleton } from "@/features/payments/components/PaymentsTableSkeleton";
import {
  fetchPaymentSummaryStats,
  fetchPayments,
} from "@/features/payments/services/payments.service";
import type { Payment } from "@/features/payments/types/payment.types";
import {
  buildPaymentListFilters,
  countActivePaymentFilters,
  DEFAULT_PAYMENT_LIST_FILTERS,
  type PaymentListFilterState,
} from "@/features/payments/utils/payment-list-filters";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user-provider";

const DEFAULT_PAGE_SIZE = 20;

function parseBillingAmount(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export function PaymentsListPage() {
  const router = useRouter();
  const { userData } = useUser();
  const isBillingUser = (userData?.groups ?? []).includes("Billing");

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
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [remainingOpeningBalance, setRemainingOpeningBalance] = useState(0);
  const [isLoadingRemaining, setIsLoadingRemaining] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [completedListStatsKey, setCompletedListStatsKey] = useState<string | null>(
    null,
  );

  const statsKey = useMemo(
    () => JSON.stringify({ search: activeSearch, filters }),
    [activeSearch, filters],
  );

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

  const statsFilters = useMemo(
    () =>
      buildPaymentListFilters({
        search: activeSearch,
        filters,
      }),
    [activeSearch, filters],
  );

  const hasNext = page * DEFAULT_PAGE_SIZE < totalCount;
  const hasPrevious = page > 1;

  const fetchStats = useCallback(
    () => fetchPaymentSummaryStats(statsFilters),
    [statsFilters],
  );

  const { stats, isStatsLoading } = useListThenStats({
    statsKey,
    listCompletedKey: completedListStatsKey,
    fetchStats,
  });

  const reloadPayments = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const response = await fetchPayments(listFilters);
      setPayments(response.results);
      setTotalCount(response.pagination?.count ?? response.results.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setCompletedListStatsKey(statsKey);
    }
  }, [listFilters, statsKey]);

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
          setCompletedListStatsKey(statsKey);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [listFilters, statsKey]);

  useEffect(() => {
    if (!recordPaymentOpen || !selectedCustomer) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const billing = await fetchCustomerBillingSummary(selectedCustomer.uuid);
        if (cancelled) {
          return;
        }
        setRemainingOpeningBalance(
          parseBillingAmount(billing.totals?.opening_balance_remaining),
        );
      } catch {
        if (!cancelled) {
          setRemainingOpeningBalance(0);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRemaining(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [recordPaymentOpen, selectedCustomer]);

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

  const handleClearSearchAndFilters = useCallback(() => {
    setIsRefreshing(true);
    setSearch("");
    setActiveSearch("");
    setFilters(DEFAULT_PAYMENT_LIST_FILTERS);
    setPage(1);
  }, []);

  function handleRecordPaymentOpenChange(open: boolean) {
    setRecordPaymentOpen(open);
    if (open) {
      setIsLoadingRemaining(Boolean(selectedCustomer));
      return;
    }
    setSelectedCustomer(null);
    setRemainingOpeningBalance(0);
    setIsLoadingRemaining(false);
  }

  function handleRecordPaymentCustomerChange(customer: Customer | null) {
    setSelectedCustomer(customer);
    setRemainingOpeningBalance(0);
    setIsLoadingRemaining(Boolean(customer));
  }

  const activeFilterCount = countActivePaymentFilters(filters);
  const hasActiveQuery = activeSearch.length > 0 || activeFilterCount > 0;
  const isFilteredEmpty =
    !isLoading && !error && payments.length === 0 && hasActiveQuery;
  const hasNoRecords =
    !isLoading && !error && totalCount === 0 && !hasActiveQuery;

  return (
    <ListPageLayout data-testid="payments-page">
      <PaymentsPageHeader
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
        onRecordPayment={() => setRecordPaymentOpen(true)}
      />

      {!hasNoRecords ? (
        <FabButton
          label={showStats ? "Hide stats" : "Show stats"}
          icon={BarChart3}
          variant="outline"
          className="bottom-24 bg-white"
          onClick={() => setShowStats((current) => !current)}
          data-testid="payments-show-stats-fab"
        />
      ) : null}

      <FabButton
        label="Record payment"
        onClick={() => setRecordPaymentOpen(true)}
        data-testid="payments-record-payment-fab"
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <ListPageStatsSection className={cn(!showStats && "hidden sm:block")}>
            <PaymentSummaryStatsCards stats={stats} isLoading={isStatsLoading} />
          </ListPageStatsSection>
        </ListPageDataSectionsStack>
      ) : null}

      <ListPageTableSection>
        {isLoading ? (
          <PaymentsTableSkeleton rows={8} />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-sm font-semibold text-red-800">Could not load payments</h2>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => void reloadPayments()}
            >
              Try again
            </Button>
          </div>
        ) : hasNoRecords ? (
          <PaymentsEmptyState onRecordPayment={() => setRecordPaymentOpen(true)} />
        ) : isFilteredEmpty ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-14 text-center">
            <h2 className="text-base font-semibold text-brand-navy">No matching payments</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Adjust your search or filters and try again.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleClearSearchAndFilters}
            >
              Clear search & filters
            </Button>
          </div>
        ) : (
          <>
            <PaymentsTable
              payments={payments}
              onRowClick={(payment) => router.push(ROUTES.paymentDetail(payment.id))}
            />
            <ListPagePagination
              page={page}
              pageSize={DEFAULT_PAGE_SIZE}
              totalCount={totalCount}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              isLoading={isRefreshing}
              onPageChange={(nextPage) => {
                setIsRefreshing(true);
                setPage(nextPage);
              }}
            />
          </>
        )}
      </ListPageTableSection>

      <RecordOpeningBalancePaymentDialog
        customer={selectedCustomer}
        remainingBalance={remainingOpeningBalance}
        open={recordPaymentOpen}
        canRecord={isBillingUser}
        showCustomerPicker
        isLoadingRemaining={isLoadingRemaining}
        onCustomerChange={handleRecordPaymentCustomerChange}
        onOpenChange={handleRecordPaymentOpenChange}
        onRecorded={() => {
          void reloadPayments();
        }}
      />
    </ListPageLayout>
  );
}
