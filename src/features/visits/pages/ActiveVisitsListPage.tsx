"use client";

import { BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { FabButton } from "@/components/ui/fab-button";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
  ListPagePagination,
  ListPageStatsSection,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { useMyClinicalCapabilities } from "@/features/clinical-opd/hooks/use-clinical-opd";
import { opdEncounterLandingHref } from "@/features/clinical-opd/utils/opd-encounter-tabs";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { ActiveVisitsEmptyState } from "@/features/visits/components/ActiveVisitsEmptyState";
import { ActiveVisitsPageHeader } from "@/features/visits/components/ActiveVisitsPageHeader";
import { ActiveVisitsTable } from "@/features/visits/components/tables/active-visits-table";
import { ActiveVisitsTableSkeleton } from "@/features/visits/components/ActiveVisitsTableSkeleton";
import { AddVisitEncounterDialog } from "@/features/visits/components/AddVisitEncounterDialog";
import { VisitDetailDialog } from "@/features/visits/components/VisitDetailDialog";
import { VisitQueueSummaryCards } from "@/features/visits/components/VisitQueueSummaryCards";
import { useVisitsList } from "@/features/visits/hooks/use-visits-list";
import {
  fetchVisitQueueSummary,
  fetchVisits,
} from "@/features/visits/services/visits.service";
import type {
  VisitDetail,
  VisitEncounter,
  VisitQueueSummary,
} from "@/features/visits/types/visit.types";
import {
  countActiveVisitFilters,
  DEFAULT_ACTIVE_VISIT_FILTERS,
  type ActiveVisitListFilterState,
} from "@/features/visits/utils/visit-list-filters";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user-provider";

export function ActiveVisitsListPage() {
  const router = useRouter();
  const { userData } = useUser();
  const { data: capabilitiesData } = useMyClinicalCapabilities();
  const [selectedVisitUuid, setSelectedVisitUuid] = useState<string | null>(null);
  const [addEncounterVisit, setAddEncounterVisit] = useState<VisitDetail | null>(
    null,
  );
  const [isAddEncounterOpen, setIsAddEncounterOpen] = useState(false);
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

  const handleFiltersApply = useCallback(
    (nextFilters: ActiveVisitListFilterState) => {
      setFilters(nextFilters);
      resetPage();
    },
    [resetPage],
  );

  const handleClearSearchAndFilters = useCallback(() => {
    handleClearSearch();
    handleFiltersApply(DEFAULT_ACTIVE_VISIT_FILTERS);
  }, [handleClearSearch, handleFiltersApply]);

  const handleRowClick = useCallback((visit: VisitDetail) => {
    setSelectedVisitUuid(visit.uuid);
  }, []);

  const handleAddEncounter = useCallback((visit: VisitDetail) => {
    setAddEncounterVisit(visit);
    setIsAddEncounterOpen(true);
  }, []);

  const handleReload = useCallback(async () => {
    await Promise.all([reload(), reloadStats()]);
  }, [reload, reloadStats]);

  const handleEncounterCreated = useCallback(
    async (created: VisitEncounter) => {
      setIsAddEncounterOpen(false);
      setAddEncounterVisit(null);
      await handleReload();

      if (created.department_type === "opd") {
        router.push(
          opdEncounterLandingHref(
            created.visit,
            created.uuid,
            capabilitiesData?.capabilities ?? [],
            userData?.user_role,
          ),
        );
      }
    },
    [
      capabilitiesData?.capabilities,
      handleReload,
      router,
      userData?.user_role,
    ],
  );

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <>
      <ListPageLayout data-testid="active-visits-page">
        <ActiveVisitsPageHeader
          search={search}
          filters={filters}
          isLoading={isRefreshing}
          onSearchChange={setSearch}
          onSearchSubmit={handleSearchSubmit}
          onClearSearch={handleClearSearch}
          onFiltersApply={handleFiltersApply}
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
          </ListPageDataSectionsStack>
        ) : null}

        <ListPageTableSection>
          {isLoading ? (
            <ActiveVisitsTableSkeleton rows={8} />
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <h2 className="text-sm font-semibold text-red-800">
                Could not load active visits
              </h2>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => void handleReload()}
              >
                Try again
              </Button>
            </div>
          ) : hasNoRecords ? (
            <ActiveVisitsEmptyState />
          ) : isFilteredEmpty ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-14 text-center">
              <h2 className="text-base font-semibold text-brand-navy">
                No matching active visits
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
              <ActiveVisitsTable
                visits={items}
                onRowClick={handleRowClick}
                onAddEncounter={handleAddEncounter}
              />
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
          )}
        </ListPageTableSection>
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

      {addEncounterVisit ? (
        <AddVisitEncounterDialog
          visit={addEncounterVisit}
          open={isAddEncounterOpen}
          onOpenChange={(open) => {
            setIsAddEncounterOpen(open);
            if (!open) {
              setAddEncounterVisit(null);
            }
          }}
          onCreated={(encounter) => {
            void handleEncounterCreated(encounter);
          }}
        />
      ) : null}
    </>
  );
}
