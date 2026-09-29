"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ListPageLayout,
  ListPagePagination,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { OhAccessDenied } from "@/features/occupational-health/components/OhAccessDenied";
import { OhQueueEmptyState } from "@/features/occupational-health/components/OhQueueEmptyState";
import { OhQueuePageHeader } from "@/features/occupational-health/components/OhQueuePageHeader";
import { OhQueuePageSkeleton } from "@/features/occupational-health/components/OhQueuePageSkeleton";
import { OhQueueTableSkeleton } from "@/features/occupational-health/components/OhQueuePageSkeleton";
import { OhQueueTable } from "@/features/occupational-health/components/OhQueueTable";
import { useOhEncounters } from "@/features/occupational-health/hooks/use-occupational-health";
import { canAccessOccupationalHealth } from "@/features/occupational-health/utils/oh-access";
import { useUser } from "@/providers/user-provider";

const DEFAULT_PAGE_SIZE = 20;

export function OhQueuePage() {
  const { userData, isLoading: isUserLoading } = useUser();
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data = [], isLoading, isFetching, error, refetch } = useOhEncounters(
    activeSearch,
  );

  const hasAccess = canAccessOccupationalHealth(userData);

  const totalCount = data.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * DEFAULT_PAGE_SIZE;
  const paginated = data.slice(pageStart, pageStart + DEFAULT_PAGE_SIZE);

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

  if (isUserLoading || isLoading) {
    return <OhQueuePageSkeleton />;
  }

  if (!hasAccess) {
    return <OhAccessDenied data-testid="oh-queue-page" />;
  }

  return (
    <ListPageLayout data-testid="oh-queue-page">
      <OhQueuePageHeader
        search={search}
        isLoading={isFetching}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onRefresh={() => void refetch()}
      />

      <ListPageTableSection>
        {isFetching && data.length === 0 ? (
          <OhQueueTableSkeleton rows={8} />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-sm font-semibold text-red-800">
              Could not load OH queue
            </h2>
            <p className="mt-2 text-sm text-red-700">
              Failed to load occupational health encounters.
            </p>
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
          <OhQueueEmptyState onRefresh={() => void refetch()} />
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
            <OhQueueTable encounters={paginated} />
            <ListPagePagination
              page={currentPage}
              pageSize={DEFAULT_PAGE_SIZE}
              totalCount={totalCount}
              hasNext={currentPage < totalPages}
              hasPrevious={currentPage > 1}
              isLoading={isFetching}
              onPageChange={setPage}
            />
          </>
        )}
      </ListPageTableSection>
    </ListPageLayout>
  );
}
