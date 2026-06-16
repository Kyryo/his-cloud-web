import type { InvoiceListFilters } from "@/features/invoices/types/invoice.types";

export type InvoiceStateFilter = "all" | "draft" | "posted" | "cancel";

export type InvoicePaymentStatusFilter =
  | "all"
  | "not_paid"
  | "partially_paid"
  | "paid"
  | "overpaid";

export type InvoiceListFilterState = {
  state: InvoiceStateFilter;
  paymentStatus: InvoicePaymentStatusFilter;
  dateFrom: string;
  dateTo: string;
};

export const DEFAULT_INVOICE_LIST_FILTERS: InvoiceListFilterState = {
  state: "all",
  paymentStatus: "all",
  dateFrom: "",
  dateTo: "",
};

export function buildInvoiceListFilters(input: {
  search: string;
  page: number;
  pageSize: number;
  filters: InvoiceListFilterState;
}): InvoiceListFilters {
  const result: InvoiceListFilters = {
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

  if (input.filters.paymentStatus !== "all") {
    result.paymentStatus = input.filters.paymentStatus;
  }

  if (input.filters.dateFrom) {
    result.dateFrom = input.filters.dateFrom;
  }

  if (input.filters.dateTo) {
    result.dateTo = input.filters.dateTo;
  }

  return result;
}

export function countActiveInvoiceFilters(filters: InvoiceListFilterState): number {
  let count = 0;
  if (filters.state !== "all") {
    count += 1;
  }
  if (filters.paymentStatus !== "all") {
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
