import type { RemittanceRejectionListFilters } from "@/features/claims/types/remittances.types";

export type RejectionPayerFilter = "all" | string;

export type RejectionListFilterState = {
  payerCode: RejectionPayerFilter;
};

export const DEFAULT_REJECTION_LIST_FILTERS: RejectionListFilterState = {
  payerCode: "all",
};

export function buildRejectionListFilters(input: {
  search: string;
  page?: number;
  pageSize?: number;
  filters: RejectionListFilterState;
}): RemittanceRejectionListFilters {
  const result: RemittanceRejectionListFilters = {};

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

  if (input.filters.payerCode !== "all") {
    result.payerCode = input.filters.payerCode;
  }

  return result;
}

export function countActiveRejectionFilters(
  filters: RejectionListFilterState,
): number {
  return filters.payerCode !== "all" ? 1 : 0;
}
