import type { SalesOrderListFilters } from "@/features/sales-orders/types/sales-order.types";

export type SalesOrderStateFilter = "all" | "draft" | "sent" | "sale" | "done" | "cancel";

export type SalesOrderInvoiceStatusFilter =
  | "all"
  | "no"
  | "to invoice"
  | "invoiced"
  | "upselling";

export type SalesOrderProviderFilter = "all" | "none" | `${number}`;

export type SalesOrderClinicFilter = "all" | `${number}`;

export type SalesOrderListFilterState = {
  state: SalesOrderStateFilter;
  invoiceStatus: SalesOrderInvoiceStatusFilter;
  providerId: SalesOrderProviderFilter;
  clinicId: SalesOrderClinicFilter;
  dateFrom: string;
  dateTo: string;
};

export const DEFAULT_SALES_ORDER_LIST_FILTERS: SalesOrderListFilterState = {
  state: "all",
  invoiceStatus: "all",
  providerId: "all",
  clinicId: "all",
  dateFrom: "",
  dateTo: "",
};

export function buildSalesOrderListFilters(input: {
  search: string;
  page: number;
  pageSize: number;
  filters: SalesOrderListFilterState;
}): SalesOrderListFilters {
  const result: SalesOrderListFilters = {
    page: input.page,
    pageSize: input.pageSize,
  };

  const trimmedSearch = input.search.trim();
  if (trimmedSearch) {
    result.search = trimmedSearch;
  }

  if (input.filters.state !== "all") {
    result.state = input.filters.state;
  }

  if (input.filters.invoiceStatus !== "all") {
    result.invoiceStatus = input.filters.invoiceStatus;
  }

  if (input.filters.providerId === "none") {
    result.hasProvider = false;
  } else if (input.filters.providerId !== "all") {
    result.providerId = Number(input.filters.providerId);
  }

  if (input.filters.clinicId !== "all") {
    result.clinicId = Number(input.filters.clinicId);
  }

  if (input.filters.dateFrom) {
    result.dateFrom = input.filters.dateFrom;
  }

  if (input.filters.dateTo) {
    result.dateTo = input.filters.dateTo;
  }

  return result;
}

export function countActiveSalesOrderFilters(
  filters: SalesOrderListFilterState,
): number {
  let count = 0;

  if (filters.state !== "all") {
    count += 1;
  }

  if (filters.invoiceStatus !== "all") {
    count += 1;
  }

  if (filters.providerId !== "all") {
    count += 1;
  }

  if (filters.clinicId !== "all") {
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

export const SALES_ORDER_STATE_OPTIONS: Array<{
  value: SalesOrderStateFilter;
  label: string;
}> = [
  { value: "all", label: "All states" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Quotation sent" },
  { value: "sale", label: "Confirmed" },
  { value: "done", label: "Locked" },
  { value: "cancel", label: "Cancelled" },
];

export const SALES_ORDER_INVOICE_STATUS_OPTIONS: Array<{
  value: SalesOrderInvoiceStatusFilter;
  label: string;
}> = [
  { value: "all", label: "All invoice statuses" },
  { value: "no", label: "Nothing to invoice" },
  { value: "to invoice", label: "To invoice" },
  { value: "invoiced", label: "Fully invoiced" },
  { value: "upselling", label: "Upselling" },
];
