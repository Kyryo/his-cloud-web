import type { ClaimListFilters } from "@/features/claims/types/claims.types";

export type ClaimStatusFilter =
  | "all"
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "cancelled";

export type ClaimListFilterState = {
  status: ClaimStatusFilter;
};

export const DEFAULT_CLAIM_LIST_FILTERS: ClaimListFilterState = {
  status: "all",
};

export function buildClaimListFilters(input: {
  search: string;
  page: number;
  pageSize: number;
  filters: ClaimListFilterState;
}): ClaimListFilters {
  const result: ClaimListFilters = {
    page: input.page,
    pageSize: input.pageSize,
  };

  const trimmedSearch = input.search.trim();
  if (trimmedSearch) {
    result.search = trimmedSearch;
  }

  if (input.filters.status !== "all") {
    result.status = input.filters.status;
  }

  return result;
}

export function countActiveClaimFilters(filters: ClaimListFilterState): number {
  return filters.status !== "all" ? 1 : 0;
}
