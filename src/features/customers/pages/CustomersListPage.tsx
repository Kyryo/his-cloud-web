"use client";

import { useRouter } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { FabButton } from "@/components/ui/fab-button";
import { Button } from "@/components/ui/button";
import { CreateCustomerDialog } from "@/features/customers/components/CreateCustomerDialog";
import { CustomerListToolbar } from "@/features/customers/components/CustomerListToolbar";
import { CustomerSummaryStats } from "@/features/customers/components/CustomerSummaryStats";
import { CustomersEmptyState } from "@/features/customers/components/CustomersEmptyState";
import { CustomersPageHeader } from "@/features/customers/components/CustomersPageHeader";
import {
  CustomersPagination,
  CustomersTable,
} from "@/features/customers/components/CustomersTable";
import {
  fetchCustomers,
} from "@/features/customers/services/customers.service";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  buildCustomerListFilters,
  countActiveCustomerFilters,
  DEFAULT_CUSTOMER_ORDERING,
  type CustomerListFilterState,
} from "@/features/customers/utils/customer-list-filters";
import {
  fetchCustomerSummaryStats,
  type CustomerSummaryStats as CustomerSummaryStatsData,
} from "@/features/customers/utils/customer-stats";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
  ListPageStatsSection,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 20;

export function CustomersListPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filters, setFilters] = useState<
    Pick<
      CustomerListFilterState,
      "gender" | "syncStatus" | "activeStatus" | "ordering"
    >
  >({
    gender: "all",
    syncStatus: "all",
    activeStatus: "all",
    ordering: DEFAULT_CUSTOMER_ORDERING,
  });
  const [stats, setStats] = useState<CustomerSummaryStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const listFilters = useMemo(
    () =>
      buildCustomerListFilters({
        search: activeSearch,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        ...filters,
      }),
    [activeSearch, filters, page],
  );

  const handleAddClient = useCallback(() => {
    setCreateDialogOpen(true);
  }, []);

  const handleCustomerCreated = useCallback(
    (customer: Customer) => {
      router.push(ROUTES.customerDetail(customer.uuid));
    },
    [router],
  );

  const reloadCustomers = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    setIsUnauthorized(false);

    try {
      const response = await fetchCustomers(listFilters);
      setCustomers(response.results);
      setTotalCount(response.pagination?.count ?? response.results.length);
      setHasNext(Boolean(response.pagination?.next));
      setHasPrevious(Boolean(response.pagination?.previous));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load clients.";

      if (message.toLowerCase().includes("not authenticated")) {
        setIsUnauthorized(true);
      } else {
        setError(message);
      }
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
        setIsUnauthorized(false);

        const response = await fetchCustomers(listFilters);
        if (cancelled) {
          return;
        }

        setCustomers(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
        setHasNext(Boolean(response.pagination?.next));
        setHasPrevious(Boolean(response.pagination?.previous));
      } catch (err) {
        if (cancelled) {
          return;
        }

        const message =
          err instanceof Error ? err.message : "Failed to load clients.";

        if (message.toLowerCase().includes("not authenticated")) {
          setIsUnauthorized(true);
        } else {
          setError(message);
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
    let cancelled = false;

    void (async () => {
      try {
        const summary = await fetchCustomerSummaryStats();
        if (!cancelled) {
          setStats(summary);
        }
      } catch {
        if (!cancelled) {
          setStats(null);
        }
      } finally {
        if (!cancelled) {
          setIsStatsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSearchSubmit() {
    setIsRefreshing(true);
    const nextSearch = search.trim();
    setPage(1);
    setActiveSearch(nextSearch);
  }

  function handleClearSearch() {
    setIsRefreshing(true);
    setSearch("");
    setActiveSearch("");
    setPage(1);
  }

  function handleFiltersApply(
    nextFilters: Pick<
      CustomerListFilterState,
      "gender" | "syncStatus" | "activeStatus" | "ordering"
    >,
  ) {
    setIsRefreshing(true);
    setFilters(nextFilters);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setIsRefreshing(true);
    setPage(nextPage);
  }

  function handleRowClick(customer: Customer) {
    router.push(ROUTES.customerDetail(customer.uuid));
  }

  if (isUnauthorized) {
    return (
      <ListPageLayout data-testid="customers-page">
        <div className="rounded-xl border border-brand-border bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-brand-navy">Access denied</h1>
          <p className="mt-2 text-sm text-brand-muted">
            You are not authorized to view clients. Sign in again or contact your
            administrator.
          </p>
          <Button className="mt-6" onClick={() => router.push(ROUTES.auth)}>
            Go to sign in
          </Button>
        </div>
      </ListPageLayout>
    );
  }

  const activeFilterCount = countActiveCustomerFilters(filters);
  const hasActiveQuery =
    activeSearch.length > 0 || activeFilterCount > 0;
  const hasNoCustomerRecords =
    !isLoading && !error && totalCount === 0 && !hasActiveQuery;
  const isFilteredEmpty =
    !isLoading && !error && customers.length === 0 && hasActiveQuery;

  return (
    <ListPageLayout data-testid="customers-page">
      <CustomersPageHeader
        onAddClient={handleAddClient}
        search={search}
        isSearchDisabled={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
      />
      <CreateCustomerDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleCustomerCreated}
      />
      {!hasNoCustomerRecords ? (
        <FabButton
          label={showStats ? "Hide stats" : "Show stats"}
          icon={BarChart3}
          variant="outline"
          className="bottom-24 bg-white"
          onClick={() => setShowStats((current) => !current)}
          data-testid="customers-show-stats-fab"
        />
      ) : null}
      <FabButton
        label="Add client"
        onClick={handleAddClient}
        data-testid="add-client-fab"
      />

      {!hasNoCustomerRecords ? (
        <ListPageDataSectionsStack>
          <ListPageStatsSection className={cn(!showStats && "hidden sm:block")}>
            <CustomerSummaryStats stats={stats} isLoading={isStatsLoading} />
          </ListPageStatsSection>
          <CustomerListToolbar
            search={search}
            filters={filters}
            isLoading={isRefreshing}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onClearSearch={handleClearSearch}
            onFiltersApply={handleFiltersApply}
          />
        </ListPageDataSectionsStack>
      ) : null}

      <ListPageTableSection>
        {isLoading ? (
          <PageLoader message="Loading clients..." />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-sm font-semibold text-red-800">Could not load clients</h2>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => void reloadCustomers()}
            >
              Try again
            </Button>
          </div>
        ) : hasNoCustomerRecords ? (
          <CustomersEmptyState onAddClient={handleAddClient} />
        ) : isFilteredEmpty ? (
          <div className="rounded-xl border border-brand-border bg-white px-6 py-14 text-center">
            <h2 className="text-lg font-semibold text-brand-navy">No matching clients</h2>
            <p className="mt-2 text-sm text-brand-muted">
              Adjust your search or filters and try again.
            </p>
          </div>
        ) : (
          <>
            <CustomersTable customers={customers} onRowClick={handleRowClick} />
            <CustomersPagination
              page={page}
              pageSize={DEFAULT_PAGE_SIZE}
              totalCount={totalCount}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              isLoading={isRefreshing}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </ListPageTableSection>
    </ListPageLayout>
  );
}
