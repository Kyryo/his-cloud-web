"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { CreateSalesOrderDialog } from "@/features/sales-orders/components/CreateSalesOrderDialog";
import { SalesOrderListToolbar } from "@/features/sales-orders/components/SalesOrderListToolbar";
import { SalesOrdersPageHeader } from "@/features/sales-orders/components/SalesOrdersPageHeader";
import {
  SalesOrdersPagination,
  SalesOrdersTable,
} from "@/features/sales-orders/components/SalesOrdersTable";
import { fetchSalesOrders } from "@/features/sales-orders/services/sales-orders.service";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  buildSalesOrderListFilters,
  countActiveSalesOrderFilters,
  DEFAULT_SALES_ORDER_LIST_FILTERS,
  type SalesOrderListFilterState,
} from "@/features/sales-orders/utils/sales-order-list-filters";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";

const DEFAULT_PAGE_SIZE = 20;

export function SalesOrdersListPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filters, setFilters] = useState<SalesOrderListFilterState>(
    DEFAULT_SALES_ORDER_LIST_FILTERS,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const listFilters = useMemo(
    () =>
      buildSalesOrderListFilters({
        search: activeSearch,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        filters,
      }),
    [activeSearch, filters, page],
  );

  const hasNext = page * DEFAULT_PAGE_SIZE < totalCount;
  const hasPrevious = page > 1;

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
    }
  }, [listFilters]);

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
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [listFilters]);

  function handleSearchSubmit() {
    setIsRefreshing(true);
    setActiveSearch(search.trim());
    setPage(1);
  }

  function handleClearSearch() {
    setIsRefreshing(true);
    setSearch("");
    setActiveSearch("");
    setPage(1);
  }

  function handleFiltersApply(nextFilters: SalesOrderListFilterState) {
    setIsRefreshing(true);
    setFilters(nextFilters);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setIsRefreshing(true);
    setPage(nextPage);
  }

  function handleRowClick(order: SalesOrder) {
    router.push(ROUTES.salesOrderDetail(order.id));
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
  const hasActiveQuery = activeSearch.length > 0 || activeFilterCount > 0;
  const isFilteredEmpty =
    !isLoading && !error && orders.length === 0 && hasActiveQuery;
  const hasNoRecords =
    !isLoading && !error && totalCount === 0 && !hasActiveQuery;

  return (
    <ListPageLayout data-testid="sales-orders-page">
      <SalesOrdersPageHeader
        onNewOrder={() => setCreateDialogOpen(true)}
        search={search}
        isSearchDisabled={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <SalesOrderListToolbar
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
          <PageLoader message="Loading sales orders..." />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-sm font-semibold text-red-800">
              Could not load sales orders
            </h2>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => void reloadOrders()}
            >
              Try again
            </Button>
          </div>
        ) : hasNoRecords ? (
          <div className="rounded-xl border border-brand-border bg-white px-6 py-14 text-center">
            <h2 className="text-lg font-semibold text-brand-navy">No sales orders yet</h2>
            <p className="mt-2 text-sm text-brand-muted">
              Sales orders from ERP will appear here once visits generate billing
              records.
            </p>
          </div>
        ) : isFilteredEmpty ? (
          <div className="rounded-xl border border-brand-border bg-white px-6 py-14 text-center">
            <h2 className="text-lg font-semibold text-brand-navy">
              No matching sales orders
            </h2>
            <p className="mt-2 text-sm text-brand-muted">
              Adjust your search or filters and try again.
            </p>
          </div>
        ) : (
          <>
            <SalesOrdersTable orders={orders} onRowClick={handleRowClick} />
            <SalesOrdersPagination
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

      <CreateSalesOrderDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={(order) => router.push(ROUTES.salesOrderDetail(order.id))}
      />
    </ListPageLayout>
  );
}
