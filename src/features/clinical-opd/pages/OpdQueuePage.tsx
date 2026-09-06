"use client";

import { BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

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
import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";
import {
  countActiveOpdQueueFilters,
  DEFAULT_OPD_QUEUE_FILTERS,
  type OpdQueueListFilterState,
} from "@/features/clinical-opd/utils/opd-queue-list-filters";
import { computeOpdQueueStats } from "@/features/clinical-opd/utils/opd-queue-stats";
import { AddVisitEncounterDialog } from "@/features/visits/components/AddVisitEncounterDialog";
import { fetchVisit } from "@/features/visits/services/visits.service";
import type { VisitDetail, VisitEncounter } from "@/features/visits/types/visit.types";
import { ROUTES } from "@/constants/routes";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { useUser } from "@/providers/user-provider";

const DEFAULT_PAGE_SIZE = 20;

export function OpdQueuePage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userData, isLoading: isUserLoading } = useUser();
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filters, setFilters] = useState<OpdQueueListFilterState>(
    DEFAULT_OPD_QUEUE_FILTERS,
  );
  const [page, setPage] = useState(1);
  const [showStats, setShowStats] = useState(false);
  const [addEncounterVisit, setAddEncounterVisit] = useState<VisitDetail | null>(
    null,
  );
  const [isAddEncounterOpen, setIsAddEncounterOpen] = useState(false);
  const [isLoadingAddEncounter, setIsLoadingAddEncounter] = useState(false);

  const statusParam = filters.status === "all" ? undefined : filters.status;
  const {
    data = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useOpdQueue({
    status: statusParam,
    search: activeSearch || undefined,
  });

  const hasAccess = (userData?.groups ?? []).includes("Clinical");

  const stats = useMemo(() => computeOpdQueueStats(data), [data]);

  const totalCount = data.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * DEFAULT_PAGE_SIZE;
  const paginatedEncounters = data.slice(pageStart, pageStart + DEFAULT_PAGE_SIZE);
  const hasNext = currentPage < totalPages;
  const hasPrevious = currentPage > 1;

  const activeFilterCount = countActiveOpdQueueFilters(filters);
  const hasActiveQuery = activeSearch.length > 0 || activeFilterCount > 0;
  const hasNoRecords = !isLoading && !error && data.length === 0 && !hasActiveQuery;
  const isFilteredEmpty =
    !isLoading && !error && data.length === 0 && hasActiveQuery;

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

  async function handleAddEncounter(encounter: OpdQueueEncounter) {
    if (encounter.visit_status !== "active") {
      toast({
        title: "Visit is not active",
        description: "Encounters can only be added to active visits.",
        variant: "error",
      });
      return;
    }

    try {
      setIsLoadingAddEncounter(true);
      const visit = await fetchVisit(encounter.visit_uuid);
      setAddEncounterVisit(visit);
      setIsAddEncounterOpen(true);
    } catch (loadError) {
      toast({
        title: "Could not load visit",
        description:
          loadError instanceof BffError
            ? formatBffErrorMessage(loadError.message, loadError.errors)
            : "Unable to open add encounter.",
        variant: "error",
      });
    } finally {
      setIsLoadingAddEncounter(false);
    }
  }

  async function handleEncounterCreated(created: VisitEncounter) {
    await queryClient.invalidateQueries({ queryKey: ["opd-queue"] });
    setIsAddEncounterOpen(false);
    setAddEncounterVisit(null);

    if (created.department_type === "opd") {
      router.push(ROUTES.clinicalOpdEncounter(created.visit, created.uuid));
      return;
    }

    toast({
      title: "Encounter added",
      description: `${created.department_name} was added. Open it from Active Visits if needed.`,
      variant: "success",
    });
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
        isLoading={isFetching || isLoadingAddEncounter}
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

      <ListPageDataSectionsStack className="space-y-0">
        {!hasNoRecords ? (
          <ListPageStatsSection className={cn(!showStats && "hidden sm:block")}>
            <OpdQueueSummaryStatsCards stats={stats} isLoading={isLoading} />
          </ListPageStatsSection>
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
              <OpdQueueTable
                encounters={paginatedEncounters}
                onAddEncounter={(encounter) => {
                  void handleAddEncounter(encounter);
                }}
              />
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
      </ListPageDataSectionsStack>

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
    </ListPageLayout>
  );
}
