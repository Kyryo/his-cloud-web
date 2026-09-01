"use client";

import { BarChart3 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ClaimListToolbar } from "@/features/claims/components/ClaimListToolbar";
import { ClaimSummaryStatsCards } from "@/features/claims/components/ClaimSummaryStatsCards";
import { ClaimsPageHeader } from "@/features/claims/components/ClaimsPageHeader";
import {
  CLAIM_TABLE_SKELETON_COLUMNS,
  ClaimsTable,
} from "@/features/claims/components/ClaimsTable";
import {
  fetchClaimSummaryStats,
  fetchClaims,
} from "@/features/claims/services/claims.service";
import type { ClaimListItem } from "@/features/claims/types/claims.types";
import {
  buildClaimListFilters,
  countActiveClaimFilters,
  type ClaimListFilterState,
} from "@/features/claims/utils/claim-list-filters";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListTableSkeleton } from "@/features/inventory/components/list/InventoryListTable";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 20;

function isClaimStatusFilter(
  value: string | null,
): value is ClaimListFilterState["status"] {
  return (
    value === "draft" ||
    value === "submitted" ||
    value === "approved" ||
    value === "rejected" ||
    value === "cancelled"
  );
}

function filtersFromSearchParams(
  params: URLSearchParams,
): ClaimListFilterState {
  const status = params.get("status");
  const attention = params.get("attention");
  return {
    status: isClaimStatusFilter(status) ? status : "all",
    attention:
      attention === "ready" || attention === "needs_attention"
        ? attention
        : "all",
  };
}

export function ClaimsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [claims, setClaims] = useState<ClaimListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filters, setFilters] = useState<ClaimListFilterState>(() =>
    filtersFromSearchParams(searchParams),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [completedListStatsKey, setCompletedListStatsKey] = useState<string | null>(
    null,
  );
  const queryKey = searchParams.toString();

  useEffect(() => {
    setFilters(filtersFromSearchParams(searchParams));
    setPage(1);
  }, [queryKey, searchParams]);

  const statsKey = useMemo(
    () => JSON.stringify({ search: activeSearch, filters }),
    [activeSearch, filters],
  );

  const listFilters = useMemo(
    () =>
      buildClaimListFilters({
        search: activeSearch,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        filters,
      }),
    [activeSearch, filters, page],
  );

  const statsFilters = useMemo(
    () =>
      buildClaimListFilters({
        search: activeSearch,
        filters,
      }),
    [activeSearch, filters],
  );

  const hasNext = page * DEFAULT_PAGE_SIZE < totalCount;
  const hasPrevious = page > 1;

  const fetchStats = useCallback(
    () => fetchClaimSummaryStats(statsFilters),
    [statsFilters],
  );

  const { stats, isStatsLoading } = useListThenStats({
    statsKey,
    listCompletedKey: completedListStatsKey,
    fetchStats,
  });

  const reloadClaims = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const response = await fetchClaims(listFilters);
      setClaims(response.results);
      setTotalCount(response.pagination?.count ?? response.results.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load claims.");
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
        const response = await fetchClaims(listFilters);
        if (cancelled) {
          return;
        }
        setClaims(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load claims.");
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

  const activeFilterCount = countActiveClaimFilters(filters);
  const hasActiveQuery = activeSearch.length > 0 || activeFilterCount > 0;
  const isFilteredEmpty =
    !isLoading && !error && claims.length === 0 && hasActiveQuery;
  const hasNoRecords =
    !isLoading && !error && totalCount === 0 && !hasActiveQuery;

  return (
    <ListPageLayout data-testid="claims-list-page">
      <ClaimsPageHeader />

      {!hasNoRecords ? (
        <FabButton
          label={showStats ? "Hide stats" : "Show stats"}
          icon={BarChart3}
          variant="outline"
          className="bottom-24 bg-white"
          onClick={() => setShowStats((current) => !current)}
          data-testid="claims-show-stats-fab"
        />
      ) : null}

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <ListPageStatsSection className={cn(!showStats && "hidden sm:block")}>
            <ClaimSummaryStatsCards stats={stats} isLoading={isStatsLoading} />
          </ListPageStatsSection>
          {isLoading ? (
            <ListPageToolbarSkeleton />
          ) : (
            <ClaimListToolbar
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
        loadingMessage="Loading claims..."
        loadingFallback={
          <InventoryListTableSkeleton columns={[...CLAIM_TABLE_SKELETON_COLUMNS]} />
        }
        error={error}
        onRetry={() => void reloadClaims()}
        errorTitle="Could not load claims"
        hasNoRecords={hasNoRecords}
        emptyState={
          <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
            <p className="text-sm font-medium text-brand-navy">No claims found</p>
            <p className="mt-2 text-sm text-brand-muted">
              Create a claim from a posted insurance invoice to get started.
            </p>
          </div>
        }
        isFilteredEmpty={isFilteredEmpty}
        filteredEmptyTitle="No matching claims"
      >
        <>
          <ClaimsTable
            claims={claims}
            onRowClick={(claim) => router.push(ROUTES.claimDetail(claim.uuid))}
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
