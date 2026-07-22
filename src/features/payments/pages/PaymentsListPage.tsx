"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { RecordOpeningBalancePaymentDialog } from "@/features/customers/components/detail/RecordOpeningBalancePaymentDialog";
import { fetchCustomerBillingSummary } from "@/features/customers/services/customer-billing.service";
import type { Customer } from "@/features/customers/types/customer.types";
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
    }
  }, [listFilters]);

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

  useEffect(() => {
    if (!recordPaymentOpen || !selectedCustomer) {
      setRemainingOpeningBalance(0);
      setIsLoadingRemaining(false);
      return;
    }

    let cancelled = false;
    setIsLoadingRemaining(true);

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

  function handleRecordPaymentOpenChange(open: boolean) {
    setRecordPaymentOpen(open);
    if (!open) {
      setSelectedCustomer(null);
      setRemainingOpeningBalance(0);
      setIsLoadingRemaining(false);
    }
  }

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
        onRecordPayment={() => setRecordPaymentOpen(true)}
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

      <RecordOpeningBalancePaymentDialog
        customer={selectedCustomer}
        remainingBalance={remainingOpeningBalance}
        open={recordPaymentOpen}
        canRecord={isBillingUser}
        showCustomerPicker
        isLoadingRemaining={isLoadingRemaining}
        onCustomerChange={setSelectedCustomer}
        onOpenChange={handleRecordPaymentOpenChange}
        onRecorded={() => {
          void reloadPayments();
        }}
      />
    </ListPageLayout>
  );
}
