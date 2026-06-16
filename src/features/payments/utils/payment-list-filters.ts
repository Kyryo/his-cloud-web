import type { PaymentListFilters } from "@/features/payments/types/payment.types";

export type PaymentStateFilter = "all" | "draft" | "posted" | "cancel";

export type PaymentListFilterState = {
  state: PaymentStateFilter;
  dateFrom: string;
  dateTo: string;
};

export const DEFAULT_PAYMENT_LIST_FILTERS: PaymentListFilterState = {
  state: "all",
  dateFrom: "",
  dateTo: "",
};

export function buildPaymentListFilters(input: {
  search: string;
  page: number;
  pageSize: number;
  filters: PaymentListFilterState;
}): PaymentListFilters {
  const result: PaymentListFilters = {
    page: input.page,
    pageSize: input.pageSize,
  };

  const trimmedSearch = input.search.trim();
  if (trimmedSearch) {
    result.name = trimmedSearch;
  }

  if (input.filters.state !== "all") {
    result.state = input.filters.state;
  }

  if (input.filters.dateFrom) {
    result.dateFrom = input.filters.dateFrom;
  }

  if (input.filters.dateTo) {
    result.dateTo = input.filters.dateTo;
  }

  return result;
}

export function countActivePaymentFilters(filters: PaymentListFilterState): number {
  let count = 0;
  if (filters.state !== "all") {
    count += 1;
  }
  if (filters.dateFrom) {
    count += 1;
  }
  if (filters.dateTo) {
    count += 1;
  }
  return count;
}
