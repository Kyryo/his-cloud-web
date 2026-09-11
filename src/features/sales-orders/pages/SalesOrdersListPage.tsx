"use client";

import { BarChart3 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { FabButton } from "@/components/ui/fab-button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageBlankState,
  ListPageDataSectionsStack,
  ListPageLayout,
  ListPagePagination,
  ListPageStatsSection,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { useListThenStats } from "@/features/app-shell/hooks/use-list-then-stats";
import { CreateSalesOrderDialog } from "@/features/sales-orders/components/CreateSalesOrderDialog";
import { SalesOrderSummaryStatsCards } from "@/features/sales-orders/components/SalesOrderSummaryStatsCards";
import { SalesOrdersEmptyState } from "@/features/sales-orders/components/SalesOrdersEmptyState";
import { SalesOrdersPageHeader } from "@/features/sales-orders/components/SalesOrdersPageHeader";
import { SalesOrdersTable } from "@/features/sales-orders/components/SalesOrdersTable";
import { SalesOrdersTableSkeleton } from "@/features/sales-orders/components/SalesOrdersTableSkeleton";
import {
  fetchSalesOrderSummaryStats,
  fetchSalesOrders,
} from "@/features/sales-orders/services/sales-orders.service";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  buildSalesOrderListFilters,
  countActiveSalesOrderFilters,
  DEFAULT_SALES_ORDER_LIST_FILTERS,
  type SalesOrderListFilterState,
} from "@/features/sales-orders/utils/sales-order-list-filters";
import {
  SALES_ORDER_NEW_PARAM,
  SALES_ORDER_PAGE_PARAM,
  SALES_ORDER_SEARCH_PARAM,
  SALES_ORDER_STATE_PARAM,
  parseSalesOrderPage,
  parseSalesOrderState,
  salesOrdersHref,
} from "@/features/sales-orders/utils/sales-order-list-url";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 20;

export function SalesOrdersListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get(SALES_ORDER_SEARCH_PARAM) ?? "";
  const page = parseSalesOrderPage(searchParams.get(SALES_ORDER_PAGE_PARAM));
  const urlState = parseSalesOrderState(
    searchParams.get(SALES_ORDER_STATE_PARAM),
  );
  const createDialogOpen = searchParams.get(SALES_ORDER_NEW_PARAM) === "1";
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState(urlSearch);
  const [syncedUrlSearch, setSyncedUrlSearch] = useState(urlSearch);
  const [localFilters, setLocalFilters] = useState<
    Omit<SalesOrderListFilterState, "state">
  >({
    invoiceStatus: DEFAULT_SALES_ORDER_LIST_FILTERS.invoiceStatus,
    providerId: DEFAULT_SALES_ORDER_LIST_FILTERS.providerId,
    clinicId: DEFAULT_SALES_ORDER_LIST_FILTERS.clinicId,
    dateFrom: DEFAULT_SALES_ORDER_LIST_FILTERS.dateFrom,
    dateTo: DEFAULT_SALES_ORDER_LIST_FILTERS.dateTo,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [completedListStatsKey, setCompletedListStatsKey] = useState<string | null>(
    null,
  );

  const filters = useMemo<SalesOrderListFilterState>(
    () => ({
      ...localFilters,
      state: urlState,
    }),
    [localFilters, urlState],
  );

  if (urlSearch !== syncedUrlSearch) {
    setSyncedUrlSearch(urlSearch);
    setSearch(urlSearch);
  }

  const statsKey = useMemo(
    () => JSON.stringify({ search: urlSearch, filters }),
    [filters, urlSearch],
  );

  const listFilters = useMemo(
    () =>
      buildSalesOrderListFilters({
        search: urlSearch,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        filters,
      }),
    [filters, page, urlSearch],
  );

  const statsFilters = useMemo(
    () =>
      buildSalesOrderListFilters({
        search: urlSearch,
        filters,
      }),
    [filters, urlSearch],
  );

  const replaceList = useCallback(
    (next: {
      search?: string;
      page?: number;
      newOrder?: boolean;
      filters?: SalesOrderListFilterState;
    }) => {
      router.replace(
        salesOrdersHref({
          search: next.search ?? urlSearch,
          page: next.page ?? page,
          newOrder: next.newOrder ?? createDialogOpen,
          filters: next.filters ?? filters,
        }),
      );
    },
    [createDialogOpen, filters, page, router, urlSearch],
  );

  const hasNext = page * DEFAULT_PAGE_SIZE < totalCount;
  const hasPrevious = page > 1;

  const fetchStats = useCallback(
    () => fetchSalesOrderSummaryStats(statsFilters),
    [statsFilters],
  );

  const { stats, isStatsLoading } = useListThenStats({
    statsKey,
    listCompletedKey: isUnauthorized ? null : completedListStatsKey,
    fetchStats,
  });

  const reloadOrders = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    setIsUnauthorized(false);

    try {
      const response = await fetchSalesOrders(listFilters);
      setOrders(response.results);
      setTotalCount(response.pagination?.count ?? response.results.length);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load sales orders.";

      if (message.toLowerCase().includes("not authenticated")) {
        setIsUnauthorized(true);
      } else {
        setError(message);
      }
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
        setIsUnauthorized(false);

        const response = await fetchSalesOrders(listFilters);
        if (cancelled) {
          return;
        }

        setOrders(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
      } catch (err) {
        if (cancelled) {
          return;
        }

        const message =
          err instanceof Error ? err.message : "Failed to load sales orders.";

        if (message.toLowerCase().includes("not authenticated")) {
          setIsUnauthorized(true);
        } else {
          setError(message);
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

  function handleSearchSubmit() {
    setIsRefreshing(true);
    replaceList({ search: search.trim(), page: 1 });
  }

  function handleClearSearch() {
    setIsRefreshing(true);
    setSearch("");
    replaceList({ search: "", page: 1 });
  }

  function handleFiltersApply(nextFilters: SalesOrderListFilterState) {
    setIsRefreshing(true);
    setLocalFilters({
      invoiceStatus: nextFilters.invoiceStatus,
      providerId: nextFilters.providerId,
      clinicId: nextFilters.clinicId,
      dateFrom: nextFilters.dateFrom,
      dateTo: nextFilters.dateTo,
    });
    replaceList({ page: 1, filters: nextFilters });
  }

  function handlePageChange(nextPage: number) {
    setIsRefreshing(true);
    replaceList({ page: nextPage });
  }

  function handleNewOrder() {
    replaceList({ newOrder: true });
  }

  function handleRowClick(order: SalesOrder) {
    router.push(ROUTES.salesOrderDetail(order.uuid));
  }

  if (isUnauthorized) {
    return (
      <ListPageLayout data-testid="sales-orders-page">
        <div className="rounded-xl border border-brand-border bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-brand-navy">Access denied</h1>
          <p className="mt-2 text-sm text-brand-muted">
            You are not authorized to view sales orders. Sign in again or contact
            your administrator.
          </p>
          <Button className="mt-6" onClick={() => router.push(ROUTES.auth)}>
            Go to sign in
          </Button>
        </div>
      </ListPageLayout>
    );
  }

  const activeFilterCount = countActiveSalesOrderFilters(filters);
  const hasActiveQuery = urlSearch.length > 0 || activeFilterCount > 0;
  const isFilteredEmpty =
    !isLoading && !error && orders.length === 0 && hasActiveQuery;
  const hasNoRecords =
    !isLoading && !error && totalCount === 0 && !hasActiveQuery;

  return (
    <ListPageLayout data-testid="sales-orders-page">
      <SalesOrdersPageHeader
        search={search}
        filters={filters}
        isLoading={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onFiltersApply={handleFiltersApply}
        onNewOrder={handleNewOrder}
      />

      {!hasNoRecords ? (
        <FabButton
          label={showStats ? "Hide stats" : "Show stats"}
          icon={BarChart3}
          variant="outline"
          className="bottom-24 bg-white"
          onClick={() => setShowStats((current) => !current)}
          data-testid="sales-orders-show-stats-fab"
        />
      ) : null}

      <FabButton
        label="New order"
        onClick={handleNewOrder}
        data-testid="new-sales-order-fab"
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack className="space-y-0">
          <ListPageStatsSection className={cn(!showStats && "hidden sm:block")}>
            <SalesOrderSummaryStatsCards
              stats={stats}
              isLoading={isStatsLoading}
            />
          </ListPageStatsSection>

          <ListPageTableSection>
            {isLoading ? (
              <SalesOrdersTableSkeleton rows={8} />
            ) : error ? (
              <ListPageBlankState
                compact
                tone="error"
                icon="file"
                title="Could not load sales orders"
                description={error}
                action={
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-lg"
                    onClick={() => void reloadOrders()}
                  >
                    Try again
                  </Button>
                }
              />
            ) : isFilteredEmpty ? (
              <ListPageBlankState
                compact
                icon="search"
                title="No matching sales orders"
                description="Adjust your search or filters and try again."
                action={
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-lg"
                    onClick={handleClearSearch}
                  >
                    Clear search and filters
                  </Button>
                }
              />
            ) : (
              <>
                <SalesOrdersTable orders={orders} onRowClick={handleRowClick} />
                <ListPagePagination
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
        </ListPageDataSectionsStack>
      ) : (
        <ListPageTableSection>
          <SalesOrdersEmptyState onNewOrder={handleNewOrder} />
        </ListPageTableSection>
      )}

      <CreateSalesOrderDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            replaceList({ newOrder: true });
            return;
          }
          replaceList({ newOrder: false });
        }}
        onCreated={(order) => router.push(ROUTES.salesOrderDetail(order.uuid))}
      />
    </ListPageLayout>
  );
}
