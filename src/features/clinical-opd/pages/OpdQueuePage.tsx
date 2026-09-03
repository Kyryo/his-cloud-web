"use client";

import { BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { FabButton } from "@/components/ui/fab-button";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
  ListPagePagination,
  ListPageStatsSection,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { OpdQueuePageSkeleton } from "@/features/clinical-opd/components/OpdQueuePageSkeleton";
import { OpdQueueEmptyState } from "@/features/clinical-opd/components/OpdQueueEmptyState";
import { OpdQueuePageHeader } from "@/features/clinical-opd/components/OpdQueuePageHeader";
import { OpdQueueSummaryStatsCards } from "@/features/clinical-opd/components/OpdQueueSummaryStatsCards";
import { OpdQueueTableSkeleton } from "@/features/clinical-opd/components/OpdQueueTableSkeleton";
import { OpdQueueTable } from "@/features/clinical-opd/components/tables/OpdQueueTable";
import { useOpdQueue } from "@/features/clinical-opd/hooks/use-clinical-opd";
import {
  countActiveOpdQueueFilters,
  DEFAULT_OPD_QUEUE_FILTERS,
  filterOpdQueueEncounters,
  type OpdQueueListFilterState,
} from "@/features/clinical-opd/utils/opd-queue-list-filters";
import { computeOpdQueueStats } from "@/features/clinical-opd/utils/opd-queue-stats";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user-provider";

const DEFAULT_PAGE_SIZE = 20;

export function OpdQueuePage() {
  const { userData, isLoading: isUserLoading } = useUser();
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filters, setFilters] = useState<OpdQueueListFilterState>(
    DEFAULT_OPD_QUEUE_FILTERS,
  );
  const [page, setPage] = useState(1);
  const [showStats, setShowStats] = useState(false);

  const {
    data = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useOpdQueue();

  const hasAccess = (userData?.groups ?? []).includes("Clinical");

  const stats = useMemo(() => computeOpdQueueStats(data), [data]);

  const filteredEncounters = useMemo(
    () => filterOpdQueueEncounters(data, activeSearch, filters),
    [activeSearch, data, filters],
  );

  const totalCount = filteredEncounters.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * DEFAULT_PAGE_SIZE;
  const paginatedEncounters = filteredEncounters.slice(
    pageStart,
    pageStart + DEFAULT_PAGE_SIZE,
  );
  const hasNext = currentPage < totalPages;
  const hasPrevious = currentPage > 1;

  const activeFilterCount = countActiveOpdQueueFilters(filters);
  const hasActiveQuery = activeSearch.length > 0 || activeFilterCount > 0;
  const hasNoRecords = !isLoading && !error && data.length === 0;
  const isFilteredEmpty =
    !isLoading && !error && filteredEncounters.length === 0 && hasActiveQuery;

  function handleSearchSubmit() {
    setActiveSearch(search.trim());
    setPage(1);
  }

  function handleClearSearch() {
    setSearch("");
    setActiveSearch("");
    setFilters(DEFAULT_OPD_QUEUE_FILTERS);
    setPage(1);
  }

  function handleFiltersApply(nextFilters: OpdQueueListFilterState) {
    setFilters(nextFilters);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
  }

  if (isUserLoading || isLoading) {
    return <OpdQueuePageSkeleton />;
  }

  if (!hasAccess) {
    return (
      <ListPageLayout data-testid="opd-queue-page">
        <div className="rounded-xl border border-brand-border bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-brand-navy">Access denied</h1>
          <p className="mt-2 text-sm text-brand-muted">
            You do not have access to the clinical module.
          </p>
        </div>
      </ListPageLayout>
    );
  }

  return (
    <ListPageLayout data-testid="opd-queue-page">
      <OpdQueuePageHeader
        search={search}
        filters={filters}
        isLoading={isFetching}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onFiltersApply={handleFiltersApply}
        onRefresh={() => void refetch()}
      />

      {!hasNoRecords ? (
        <FabButton
          label={showStats ? "Hide stats" : "Show stats"}
          icon={BarChart3}
          variant="outline"
          className="bottom-24 bg-white"
          onClick={() => setShowStats((current) => !current)}
          data-testid="opd-queue-show-stats-fab"
        />
      ) : null}

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <ListPageStatsSection className={cn(!showStats && "hidden sm:block")}>
            <OpdQueueSummaryStatsCards stats={stats} isLoading={isLoading} />
          </ListPageStatsSection>
        </ListPageDataSectionsStack>
      ) : null}

      <ListPageTableSection>
        {isLoading ? (
          <OpdQueueTableSkeleton rows={8} />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-sm font-semibold text-red-800">
              Could not load OPD queue
            </h2>
            <p className="mt-2 text-sm text-red-700">Failed to load OPD queue.</p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          </div>
        ) : hasNoRecords ? (
          <OpdQueueEmptyState onRefresh={() => void refetch()} />
        ) : isFilteredEmpty ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-14 text-center">
            <h2 className="text-base font-semibold text-brand-navy">
              No matching encounters
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Adjust your search or filters and try again.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleClearSearch}
            >
              Clear search & filters
            </Button>
          </div>
        ) : (
          <>
            <OpdQueueTable encounters={paginatedEncounters} />
            <ListPagePagination
              page={currentPage}
              pageSize={DEFAULT_PAGE_SIZE}
              totalCount={totalCount}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              isLoading={isFetching}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </ListPageTableSection>
    </ListPageLayout>
  );
}
