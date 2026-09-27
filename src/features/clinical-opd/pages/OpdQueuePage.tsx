"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ListPageLayout,
  ListPagePagination,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { OpdQueuePageSkeleton } from "@/features/clinical-opd/components/OpdQueuePageSkeleton";
import { OpdQueueEmptyState } from "@/features/clinical-opd/components/OpdQueueEmptyState";
import { OpdQueuePageHeader } from "@/features/clinical-opd/components/OpdQueuePageHeader";
import { OpdQueueTableSkeleton } from "@/features/clinical-opd/components/OpdQueueTableSkeleton";
import { OpdQueueTable } from "@/features/clinical-opd/components/tables/OpdQueueTable";
import { OpdQueueList } from "@/features/clinical-opd/components/OpdQueueList";
import {
  useMyClinicalCapabilities,
  useOpdQueue,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";
import type { OpdQueueViewMode } from "@/features/clinical-opd/utils/opd-queue-views";
import { opdEncounterLandingHref } from "@/features/clinical-opd/utils/opd-encounter-tabs";
import { useUser } from "@/providers/user-provider";

const DEFAULT_PAGE_SIZE = 20;

export function OpdQueuePage() {
  const { userData, isLoading: isUserLoading } = useUser();
  const { data: capabilitiesData } = useMyClinicalCapabilities();
  const landingHref = (encounter: OpdQueueEncounter) =>
    opdEncounterLandingHref(
      encounter.visit_uuid,
      encounter.encounter_uuid,
      capabilitiesData?.capabilities ?? [],
      userData?.user_role,
    );
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<OpdQueueViewMode>("table");

  const {
    data = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useOpdQueue({
    search: activeSearch || undefined,
  });

  const hasAccess = (userData?.groups ?? []).includes("Clinical");

  const totalCount = data.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * DEFAULT_PAGE_SIZE;
  const paginatedEncounters = data.slice(pageStart, pageStart + DEFAULT_PAGE_SIZE);
  const hasNext = currentPage < totalPages;
  const hasPrevious = currentPage > 1;

  const hasActiveQuery = activeSearch.length > 0;
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
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
  }

  function handleViewModeChange(nextMode: OpdQueueViewMode) {
    setViewMode(nextMode);
    setPage(1);
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
        viewMode={viewMode}
        isLoading={isFetching}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onViewModeChange={handleViewModeChange}
        onRefresh={() => void refetch()}
      />

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
              Adjust your search and try again.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleClearSearch}
            >
              Clear search
            </Button>
          </div>
        ) : (
          <>
            {viewMode === "list" ? (
              <OpdQueueList
                encounters={data}
                encounterHref={landingHref}
              />
            ) : (
              <OpdQueueTable
                encounters={paginatedEncounters}
                encounterHref={landingHref}
              />
            )}
            {viewMode === "table" ? (
              <ListPagePagination
                page={currentPage}
                pageSize={DEFAULT_PAGE_SIZE}
                totalCount={totalCount}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                isLoading={isFetching}
                onPageChange={handlePageChange}
              />
            ) : null}
          </>
        )}
      </ListPageTableSection>
    </ListPageLayout>
  );
}
