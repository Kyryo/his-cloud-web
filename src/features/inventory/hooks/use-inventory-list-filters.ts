"use client";

import { useCallback, useMemo, useState } from "react";

import { useInventoryList } from "@/features/inventory/hooks/use-inventory-list";
import type { InventoryListFilters } from "@/features/inventory/types/inventory.types";
import type { PaginatedListResponse } from "@/types/api.types";

type UseInventoryListFiltersOptions<T, F> = {
  fetchFn: (filters: InventoryListFilters) => Promise<PaginatedListResponse<T>>;
  defaultSheetFilters: F;
  buildExtraFilters: (
    sheetFilters: F,
  ) => Omit<InventoryListFilters, "page" | "pageSize" | "search">;
  countActiveSheetFilters: (sheetFilters: F) => number;
  pageSize?: number;
};

export function useInventoryListFilters<T, F>({
  fetchFn,
  defaultSheetFilters,
  buildExtraFilters,
  countActiveSheetFilters,
  pageSize,
}: UseInventoryListFiltersOptions<T, F>) {
  const [sheetFilters, setSheetFilters] = useState(defaultSheetFilters);

  const extraFiltersSerialized = useMemo(
    () => JSON.stringify(buildExtraFilters(sheetFilters)),
    [buildExtraFilters, sheetFilters],
  );

  const extraFilters = useMemo(
    () =>
      JSON.parse(extraFiltersSerialized) as Omit<
        InventoryListFilters,
        "page" | "pageSize" | "search"
      >,
    [extraFiltersSerialized],
  );

  const { handlePageChange, ...list } = useInventoryList<T>({
    fetchFn,
    extraFilters,
    pageSize,
    countActiveSheetFilters: () => countActiveSheetFilters(sheetFilters),
  });

  const handleFiltersApply = useCallback(
    (nextFilters: F) => {
      setSheetFilters(nextFilters);
      handlePageChange(1);
    },
    [handlePageChange],
  );

  return {
    ...list,
    handlePageChange,
    sheetFilters,
    handleFiltersApply,
  };
}
