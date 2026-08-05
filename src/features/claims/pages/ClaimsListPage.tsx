"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { ClaimListToolbar } from "@/features/claims/components/ClaimListToolbar";
import { ClaimsPageHeader } from "@/features/claims/components/ClaimsPageHeader";
import {
  ClaimsPagination,
  ClaimsTable,
} from "@/features/claims/components/ClaimsTable";
import { fetchClaims } from "@/features/claims/services/claims.service";
import type { ClaimListItem } from "@/features/claims/types/claims.types";
import {
  buildClaimListFilters,
  DEFAULT_CLAIM_LIST_FILTERS,
  type ClaimListFilterState,
} from "@/features/claims/utils/claim-list-filters";

const DEFAULT_PAGE_SIZE = 20;

export function ClaimsListPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<ClaimListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filters, setFilters] = useState<ClaimListFilterState>(
    DEFAULT_CLAIM_LIST_FILTERS,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    }
  }, [listFilters]);

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
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [listFilters]);

  function handleSearchSubmit() {
    setIsRefreshing(true);
    setPage(1);
    setActiveSearch(search.trim());
  }

  function handleClearSearch() {
    setIsRefreshing(true);
    setSearch("");
    setActiveSearch("");
    setPage(1);
  }

  function handleFiltersApply(next: ClaimListFilterState) {
    setIsRefreshing(true);
    setFilters(next);
    setPage(1);
  }

  return (
    <ListPageLayout data-testid="claims-list-page">
      <ClaimsPageHeader
        search={search}
        isSearchDisabled={isLoading || isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
      />

      <ListPageDataSectionsStack>
        <ClaimListToolbar
          search={search}
          filters={filters}
          isLoading={isLoading || isRefreshing}
          onSearchChange={setSearch}
          onSearchSubmit={handleSearchSubmit}
          onClearSearch={handleClearSearch}
          onFiltersApply={handleFiltersApply}
        />

        <ListPageTableSection>
          {isLoading ? (
            <PageLoader message="Loading claims..." />
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm text-red-700">{error}</p>
              <button
                type="button"
                className="mt-3 text-sm font-medium text-red-800 underline"
                onClick={() => void reloadClaims()}
              >
                Try again
              </button>
            </div>
          ) : claims.length === 0 ? (
            <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-12 text-center">
              <p className="text-sm font-medium text-brand-navy">No claims found</p>
              <p className="mt-1 text-sm text-brand-muted">
                Create a claim from a posted insurance invoice to get started.
              </p>
            </div>
          ) : (
            <>
              <ClaimsTable
                claims={claims}
                onRowClick={(claim) => router.push(ROUTES.claimDetail(claim.id))}
              />
              <ClaimsPagination
                page={page}
                pageSize={DEFAULT_PAGE_SIZE}
                totalCount={totalCount}
                onPageChange={setPage}
              />
            </>
          )}
        </ListPageTableSection>
      </ListPageDataSectionsStack>
    </ListPageLayout>
  );
}
