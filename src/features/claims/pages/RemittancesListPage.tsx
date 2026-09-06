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
import { RemittancesEmptyState } from "@/features/claims/components/RemittancesEmptyState";
import { RemittancesPageHeader } from "@/features/claims/components/RemittancesPageHeader";
import { RemittanceSummaryStatsCards } from "@/features/claims/components/RemittanceSummaryStatsCards";
import { RemittancesTable } from "@/features/claims/components/RemittancesTable";
import { RemittancesTableSkeleton } from "@/features/claims/components/RemittancesTableSkeleton";
import { UploadRemittanceDialog } from "@/features/claims/components/UploadRemittanceDialog";
import {
  fetchRemittanceBatches,
  fetchRemittanceSummaryStats,
} from "@/features/claims/services/remittances.service";
import type { RemittanceBatch } from "@/features/claims/types/remittances.types";
import {
  buildRemittanceListFilters,
  countActiveRemittanceFilters,
  DEFAULT_REMITTANCE_LIST_FILTERS,
  type RemittanceListFilterState,
} from "@/features/claims/utils/remittance-list-filters";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 20;

export function RemittancesListPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<RemittanceBatch[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filters, setFilters] = useState<RemittanceListFilterState>(
    DEFAULT_REMITTANCE_LIST_FILTERS,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
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
      buildRemittanceListFilters({
        search: activeSearch,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        filters,
      }),
    [activeSearch, filters, page],
  );

  const statsFilters = useMemo(
    () =>
      buildRemittanceListFilters({
        search: activeSearch,
        filters,
      }),
    [activeSearch, filters],
  );

  const hasNext = page * DEFAULT_PAGE_SIZE < totalCount;
  const hasPrevious = page > 1;

  const fetchStats = useCallback(
    () => fetchRemittanceSummaryStats(statsFilters),
    [statsFilters],
  );

  const { stats, isStatsLoading } = useListThenStats({
    statsKey,
    listCompletedKey: completedListStatsKey,
    fetchStats,
  });

  const reload = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const response = await fetchRemittanceBatches(listFilters);
      setBatches(response.results);
      setTotalCount(response.pagination?.count ?? response.results.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load remittances.");
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
        const response = await fetchRemittanceBatches(listFilters);
        if (cancelled) {
          return;
        }
        setBatches(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load remittances.");
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
    const hasActive = batches.some(
      (batch) => batch.status === "queued" || batch.status === "processing",
    );
    if (!hasActive) {
      return;
    }
    const timer = window.setInterval(() => {
      void reload();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [batches, reload]);

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
    setFilters(DEFAULT_REMITTANCE_LIST_FILTERS);
    setPage(1);
  }, []);

  const handleFiltersApply = useCallback((nextFilters: RemittanceListFilterState) => {
    setIsRefreshing(true);
    setFilters(nextFilters);
    setPage(1);
  }, []);

  const activeFilterCount = countActiveRemittanceFilters(filters);
  const hasActiveQuery = activeSearch.length > 0 || activeFilterCount > 0;
  const isFilteredEmpty =
    !isLoading && !error && batches.length === 0 && hasActiveQuery;
  const hasNoRecords =
    !isLoading && !error && totalCount === 0 && !hasActiveQuery;

  return (
    <ListPageLayout data-testid="remittances-list-page">
      <RemittancesPageHeader
        search={search}
        filters={filters}
        isLoading={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onFiltersApply={handleFiltersApply}
        onUploadClick={() => setUploadOpen(true)}
      />

      {!hasNoRecords ? (
        <FabButton
          label={showStats ? "Hide stats" : "Show stats"}
          icon={BarChart3}
          variant="outline"
          className="bottom-24 bg-white"
          onClick={() => setShowStats((current) => !current)}
          data-testid="remittances-show-stats-fab"
        />
      ) : null}

      <FabButton
        label="Upload remittance"
        onClick={() => setUploadOpen(true)}
        data-testid="remittance-upload-fab"
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <ListPageStatsSection className={cn(!showStats && "hidden sm:block")}>
            <RemittanceSummaryStatsCards stats={stats} isLoading={isStatsLoading} />
          </ListPageStatsSection>
        </ListPageDataSectionsStack>
      ) : null}

      <ListPageTableSection>
        {isLoading ? (
          <RemittancesTableSkeleton rows={8} />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-sm font-semibold text-red-800">
              Could not load remittances
            </h2>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => void reload()}
            >
              Try again
            </Button>
          </div>
        ) : hasNoRecords ? (
          <RemittancesEmptyState onUploadClick={() => setUploadOpen(true)} />
        ) : isFilteredEmpty ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-14 text-center">
            <h2 className="text-base font-semibold text-brand-navy">
              No matching remittances
            </h2>
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
            <RemittancesTable
              batches={batches}
              onRowClick={(batch) => router.push(ROUTES.remittanceDetail(batch.uuid))}
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

      <UploadRemittanceDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={(batch) => {
          setUploadOpen(false);
          void reload();
          router.push(ROUTES.remittanceDetail(batch.uuid));
        }}
      />
    </ListPageLayout>
  );
}
