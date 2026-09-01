import type { RemittanceListFilters } from "@/features/claims/types/remittances.types";

export type RemittanceStatusFilter =
  | "all"
  | "queued"
  | "processing"
  | "processed"
  | "failed"
  | "needs_review";

export type RemittanceListFilterState = {
  status: RemittanceStatusFilter;
};

export const DEFAULT_REMITTANCE_LIST_FILTERS: RemittanceListFilterState = {
  status: "all",
};

export function buildRemittanceListFilters(input: {
  search: string;
  page?: number;
  pageSize?: number;
  filters: RemittanceListFilterState;
}): RemittanceListFilters {
  const result: RemittanceListFilters = {};

  if (input.page) {
    result.page = input.page;
  }
  if (input.pageSize) {
    result.pageSize = input.pageSize;
  }

  const trimmedSearch = input.search.trim();
  if (trimmedSearch) {
    result.search = trimmedSearch;
  }

  if (input.filters.status !== "all") {
    result.status = input.filters.status;
  }

  return result;
}

export function countActiveRemittanceFilters(
  filters: RemittanceListFilterState,
): number {
  return filters.status !== "all" ? 1 : 0;
}
