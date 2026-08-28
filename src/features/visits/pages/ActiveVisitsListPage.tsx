"use client";

import { BarChart3, Calendar } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { FabButton } from "@/components/ui/fab-button";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
  ListPagePagination,
  ListPageStatsSection,
  ListPageToolbarSkeleton,
} from "@/features/app-shell/components/page-layout";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListPageHeader } from "@/features/inventory/components/list/InventoryListPageHeader";
import { InventoryListTableSkeleton } from "@/features/inventory/components/list/InventoryListTable";
import { ActiveVisitsListToolbar } from "@/features/visits/components/ActiveVisitsListToolbar";
import {
  ACTIVE_VISITS_TABLE_SKELETON_COLUMNS,
  ActiveVisitsTable,
} from "@/features/visits/components/tables/active-visits-table";
import { VisitDetailDialog } from "@/features/visits/components/VisitDetailDialog";
import { VisitQueueSummaryCards } from "@/features/visits/components/VisitQueueSummaryCards";
import { useVisitsList } from "@/features/visits/hooks/use-visits-list";
import {
  fetchVisitQueueSummary,
  fetchVisits,
} from "@/features/visits/services/visits.service";
import type { VisitDetail, VisitQueueSummary } from "@/features/visits/types/visit.types";
import {
  countActiveVisitFilters,
  DEFAULT_ACTIVE_VISIT_FILTERS,
  type ActiveVisitListFilterState,
} from "@/features/visits/utils/visit-list-filters";
import { cn } from "@/lib/utils";

export function ActiveVisitsListPage() {
  const [selectedVisitUuid, setSelectedVisitUuid] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<VisitQueueSummary | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [filters, setFilters] = useState<ActiveVisitListFilterState>(
    DEFAULT_ACTIVE_VISIT_FILTERS,
  );
  const extraFilters = useMemo(
    () => ({
      clinicUuid: filters.clinicUuid || undefined,
    }),
    [filters],
  );
  const hasActiveFilters = countActiveVisitFilters(filters) > 0;
  const fetchFn = useCallback(
    (listFilters: Parameters<typeof fetchVisits>[0]) =>
      fetchVisits({ ...listFilters, status: "active", isActive: true }),
    [],
  );

  const {
    items,
    totalCount,
    page,
    pageSize,
    search,
    isLoading,
    isRefreshing,
    error,
    isUnauthorized,
    hasNext,
    hasPrevious,
    hasNoRecords,
    isFilteredEmpty,
    setSearch,
    handleSearchSubmit,
    handleClearSearch,
    reload,
    handlePageChange,
    resetPage,
  } = useVisitsList<VisitDetail>({ fetchFn, extraFilters, hasActiveFilters });

  const reloadStats = useCallback(async () => {
    try {
      const summary = await fetchVisitQueueSummary();
      setStats(summary);
    } catch {
      setStats(null);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const summary = await fetchVisitQueueSummary();
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

  const handleRowClick = useCallback((visit: VisitDetail) => {
    setSelectedVisitUuid(visit.uuid);
  }, []);

  const handleReload = useCallback(async () => {
    await Promise.all([reload(), reloadStats()]);
  }, [reload, reloadStats]);

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <>
      <ListPageLayout data-testid="active-visits-page">
        <InventoryListPageHeader
          title="Active visits"
          description="Patients currently in clinic with open visits and encounters."
        />

        {!hasNoRecords ? (
          <FabButton
            label={showStats ? "Hide stats" : "Show stats"}
            icon={BarChart3}
            variant="outline"
            className="bottom-24 bg-white"
            onClick={() => setShowStats((current) => !current)}
            data-testid="active-visits-show-stats-fab"
          />
        ) : null}

        {!hasNoRecords ? (
          <ListPageDataSectionsStack>
            <ListPageStatsSection className={cn(!showStats && "hidden sm:block")}>
              <VisitQueueSummaryCards stats={stats} isLoading={isStatsLoading} />
            </ListPageStatsSection>
            {isLoading ? (
              <ListPageToolbarSkeleton />
            ) : (
              <ActiveVisitsListToolbar
                search={search}
                filters={filters}
                isLoading={isRefreshing}
                onSearchChange={setSearch}
                onSearchSubmit={handleSearchSubmit}
                onClearSearch={handleClearSearch}
                onFiltersApply={(nextFilters) => {
                  setFilters(nextFilters);
                  resetPage();
                }}
              />
            )}
          </ListPageDataSectionsStack>
        ) : null}

        <InventoryListPageContent
          isLoading={isLoading}
          loadingMessage="Loading active visits..."
          loadingFallback={
            <InventoryListTableSkeleton columns={ACTIVE_VISITS_TABLE_SKELETON_COLUMNS} />
          }
          error={error}
          onRetry={() => void handleReload()}
          errorTitle="Could not load active visits"
          hasNoRecords={hasNoRecords}
          emptyState={
            <InventoryListEmptyState
              icon={Calendar}
              title="No active visits"
              description="Walk-in and appointment-backed visits will appear here while they are open."
            />
          }
          isFilteredEmpty={isFilteredEmpty}
          filteredEmptyTitle="No matching active visits"
        >
          <>
            <ActiveVisitsTable visits={items} onRowClick={handleRowClick} />
            <ListPagePagination
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              isLoading={isRefreshing}
              onPageChange={handlePageChange}
            />
          </>
        </InventoryListPageContent>
      </ListPageLayout>

      <VisitDetailDialog
        visitUuid={selectedVisitUuid}
        open={Boolean(selectedVisitUuid)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedVisitUuid(null);
          }
        }}
        onVisitUpdated={() => void handleReload()}
      />
    </>
  );
}
