"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { InventoryListFilters } from "@/features/inventory/types/inventory.types";
import type { PaginatedListResponse } from "@/types/api.types";

const DEFAULT_PAGE_SIZE = 20;

const EMPTY_EXTRA_FILTERS: Omit<
  InventoryListFilters,
  "page" | "pageSize" | "search"
> = {};

type UseInventoryListOptions<T> = {
  fetchFn: (filters: InventoryListFilters) => Promise<PaginatedListResponse<T>>;
  pageSize?: number;
  extraFilters?: Omit<InventoryListFilters, "page" | "pageSize" | "search">;
  countActiveSheetFilters?: () => number;
};

export function useInventoryList<T>({
  fetchFn,
  pageSize = DEFAULT_PAGE_SIZE,
  extraFilters,
  countActiveSheetFilters,
}: UseInventoryListOptions<T>) {
  const resolvedExtraFilters = extraFilters ?? EMPTY_EXTRA_FILTERS;
  const [items, setItems] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const listFilters = useMemo(
    () => ({
      page,
      pageSize,
      search: activeSearch || undefined,
      ...resolvedExtraFilters,
    }),
    [activeSearch, page, pageSize, resolvedExtraFilters],
  );

  const hasNext = page * pageSize < totalCount;
  const hasPrevious = page > 1;

  const reload = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    setIsUnauthorized(false);

    try {
      const response = await fetchFn(listFilters);
      setItems(response.results ?? []);
      setTotalCount(
        response.pagination?.count ?? (response.results ?? []).length,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load records.";

      if (message.toLowerCase().includes("not authenticated")) {
        setIsUnauthorized(true);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchFn, listFilters]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setError(null);
        setIsUnauthorized(false);
        const response = await fetchFn(listFilters);
        if (cancelled) {
          return;
        }
        setItems(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
      } catch (err) {
        if (cancelled) {
          return;
        }
        const message =
          err instanceof Error ? err.message : "Failed to load records.";

        if (message.toLowerCase().includes("not authenticated")) {
          setIsUnauthorized(true);
        } else {
          setError(message);
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
  }, [fetchFn, listFilters]);

  function handleSearchSubmit() {
    setIsRefreshing(true);
    setActiveSearch(search.trim());
    setPage(1);
  }

  function handleClearSearch() {
    setIsRefreshing(true);
    setSearch("");
    setActiveSearch("");
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setIsRefreshing(true);
    setPage(nextPage);
  }

  const activeFilterCount =
    (countActiveSheetFilters?.() ?? 0) + (activeSearch.length > 0 ? 1 : 0);
  const hasActiveQuery = activeFilterCount > 0;
  const hasNoRecords =
    !isLoading && !error && totalCount === 0 && !hasActiveQuery;
  const isFilteredEmpty =
    !isLoading && !error && items.length === 0 && hasActiveQuery;

  return {
    items,
    totalCount,
    page,
    pageSize,
    search,
    activeSearch,
    isLoading,
    isRefreshing,
    error,
    isUnauthorized,
    hasNext,
    hasPrevious,
    hasNoRecords,
    isFilteredEmpty,
    hasActiveQuery,
    activeFilterCount,
    setSearch,
    handleSearchSubmit,
    handleClearSearch,
    handlePageChange,
    reload,
  };
}
