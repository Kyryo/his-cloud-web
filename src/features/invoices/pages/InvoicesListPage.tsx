"use client";

import { BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { FabButton } from "@/components/ui/fab-button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
  ListPagePagination,
  ListPageStatsSection,
  ListPageToolbarSkeleton,
} from "@/features/app-shell/components/page-layout";
import { useListThenStats } from "@/features/app-shell/hooks/use-list-then-stats";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListTableSkeleton } from "@/features/inventory/components/list/InventoryListTable";
import { InvoiceListToolbar } from "@/features/invoices/components/InvoiceListToolbar";
import { InvoiceSummaryStatsCards } from "@/features/invoices/components/InvoiceSummaryStatsCards";
import { InvoicesPageHeader } from "@/features/invoices/components/InvoicesPageHeader";
import {
  INVOICE_TABLE_SKELETON_COLUMNS,
  InvoicesTable,
} from "@/features/invoices/components/InvoicesTable";
import {
  fetchInvoiceSummaryStats,
  fetchInvoices,
} from "@/features/invoices/services/invoices.service";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  buildInvoiceListFilters,
  countActiveInvoiceFilters,
  DEFAULT_INVOICE_LIST_FILTERS,
  type InvoiceListFilterState,
} from "@/features/invoices/utils/invoice-list-filters";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 20;

export function InvoicesListPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filters, setFilters] = useState<InvoiceListFilterState>(
    DEFAULT_INVOICE_LIST_FILTERS,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      buildInvoiceListFilters({
        search: activeSearch,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        filters,
      }),
    [activeSearch, filters, page],
  );

  const statsFilters = useMemo(
    () =>
      buildInvoiceListFilters({
        search: activeSearch,
        filters,
      }),
    [activeSearch, filters],
  );

  const hasNext = page * DEFAULT_PAGE_SIZE < totalCount;
  const hasPrevious = page > 1;

  const fetchStats = useCallback(
    () => fetchInvoiceSummaryStats(statsFilters),
    [statsFilters],
  );

  const { stats, isStatsLoading } = useListThenStats({
    statsKey,
    listCompletedKey: completedListStatsKey,
    fetchStats,
  });

  const reloadInvoices = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const response = await fetchInvoices(listFilters);
      setInvoices(response.results);
      setTotalCount(response.pagination?.count ?? response.results.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices.");
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
        const response = await fetchInvoices(listFilters);
        if (cancelled) {
          return;
        }
        setInvoices(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load invoices.");
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

  const activeFilterCount = countActiveInvoiceFilters(filters);
  const hasActiveQuery = activeSearch.length > 0 || activeFilterCount > 0;
  const isFilteredEmpty =
    !isLoading && !error && invoices.length === 0 && hasActiveQuery;
  const hasNoRecords =
    !isLoading && !error && totalCount === 0 && !hasActiveQuery;

  return (
    <ListPageLayout data-testid="invoices-page">
      <InvoicesPageHeader />

      {!hasNoRecords ? (
        <FabButton
          label={showStats ? "Hide stats" : "Show stats"}
          icon={BarChart3}
          variant="outline"
          className="bottom-24 bg-white"
          onClick={() => setShowStats((current) => !current)}
          data-testid="invoices-show-stats-fab"
        />
      ) : null}

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <ListPageStatsSection className={cn(!showStats && "hidden sm:block")}>
            <InvoiceSummaryStatsCards stats={stats} isLoading={isStatsLoading} />
          </ListPageStatsSection>
          {isLoading ? (
            <ListPageToolbarSkeleton />
          ) : (
            <InvoiceListToolbar
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
          )}
        </ListPageDataSectionsStack>
      ) : null}

      <InventoryListPageContent
        isLoading={isLoading}
        loadingMessage="Loading invoices..."
        loadingFallback={
          <InventoryListTableSkeleton columns={[...INVOICE_TABLE_SKELETON_COLUMNS]} />
        }
        error={error}
        onRetry={() => void reloadInvoices()}
        errorTitle="Could not load invoices"
        hasNoRecords={hasNoRecords}
        emptyState={
          <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
            <p className="text-sm font-medium text-brand-navy">No invoices found</p>
            <p className="mt-2 text-sm text-brand-muted">
              Invoices will appear here once sales orders are converted.
            </p>
          </div>
        }
        isFilteredEmpty={isFilteredEmpty}
        filteredEmptyTitle="No matching invoices"
      >
        <>
          <InvoicesTable
            invoices={invoices}
            onRowClick={(invoice) => router.push(ROUTES.invoiceDetail(invoice.uuid))}
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
      </InventoryListPageContent>
    </ListPageLayout>
  );
}
