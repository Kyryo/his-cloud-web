"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { FetchVisitsOptions } from "@/features/visits/types/visit.types";
import type { PaginatedListResponse } from "@/types/api.types";

const DEFAULT_PAGE_SIZE = 20;

const EMPTY_EXTRA_FILTERS: Omit<
  FetchVisitsOptions,
  "page" | "pageSize" | "search"
> = {};

type UseVisitsListOptions<T> = {
  fetchFn: (filters: FetchVisitsOptions) => Promise<PaginatedListResponse<T>>;
  pageSize?: number;
  extraFilters?: Omit<FetchVisitsOptions, "page" | "pageSize" | "search">;
};

export function useVisitsList<T>({
  fetchFn,
  pageSize = DEFAULT_PAGE_SIZE,
  extraFilters,
}: UseVisitsListOptions<T>) {
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
      setItems(response.results);
      setTotalCount(response.pagination?.count ?? response.results.length);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load visits.";
      setError(message);
      if (message.toLowerCase().includes("unauthorized")) {
        setIsUnauthorized(true);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFn, listFilters]);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      setIsUnauthorized(false);

      try {
        const response = await fetchFn(listFilters);
        if (active) {
          setItems(response.results);
          setTotalCount(response.pagination?.count ?? response.results.length);
        }
      } catch (err) {
        if (active) {
          const message =
            err instanceof Error ? err.message : "Failed to load visits.";
          setError(message);
          if (message.toLowerCase().includes("unauthorized")) {
            setIsUnauthorized(true);
          }
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [fetchFn, listFilters]);

  return {
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
    hasNoRecords: !isLoading && !error && items.length === 0 && !activeSearch,
    isFilteredEmpty:
      !isLoading && !error && items.length === 0 && Boolean(activeSearch),
    setSearch,
    handleSearchSubmit: () => {
      setPage(1);
      setActiveSearch(search.trim());
    },
    handleClearSearch: () => {
      setSearch("");
      setActiveSearch("");
      setPage(1);
    },
    reload,
    handlePageChange: (nextPage: number) => setPage(nextPage),
  };
}
