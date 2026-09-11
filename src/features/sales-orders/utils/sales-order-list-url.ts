import { ROUTES } from "@/constants/routes";
import {
  DEFAULT_SALES_ORDER_LIST_FILTERS,
  type SalesOrderListFilterState,
  type SalesOrderStateFilter,
} from "@/features/sales-orders/utils/sales-order-list-filters";

export const SALES_ORDER_SEARCH_PARAM = "q";
export const SALES_ORDER_PAGE_PARAM = "page";
export const SALES_ORDER_NEW_PARAM = "new";
export const SALES_ORDER_STATE_PARAM = "state";

export function parseSalesOrderPage(value: string | null | undefined): number {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }
  return page;
}

export function parseSalesOrderState(
  value: string | null | undefined,
): SalesOrderStateFilter {
  if (
    value === "draft" ||
    value === "sent" ||
    value === "sale" ||
    value === "done" ||
    value === "cancel"
  ) {
    return value;
  }
  return "all";
}

type SalesOrdersHrefOptions = {
  search?: string;
  page?: number;
  newOrder?: boolean;
  filters?: Partial<SalesOrderListFilterState>;
};

export function salesOrdersHref({
  search = "",
  page = 1,
  newOrder = false,
  filters = {},
}: SalesOrdersHrefOptions = {}): string {
  const params = new URLSearchParams();
  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    params.set(SALES_ORDER_SEARCH_PARAM, trimmedSearch);
  }
  if (page > 1) {
    params.set(SALES_ORDER_PAGE_PARAM, String(page));
  }
  if (newOrder) {
    params.set(SALES_ORDER_NEW_PARAM, "1");
  }
  const state = filters.state ?? DEFAULT_SALES_ORDER_LIST_FILTERS.state;
  if (state !== "all") {
    params.set(SALES_ORDER_STATE_PARAM, state);
  }
  const query = params.toString();
  return query ? `${ROUTES.salesOrders}?${query}` : ROUTES.salesOrders;
}

export function filtersFromSalesOrderSearchParams(
  searchParams: URLSearchParams,
): SalesOrderListFilterState {
  return {
    ...DEFAULT_SALES_ORDER_LIST_FILTERS,
    state: parseSalesOrderState(searchParams.get(SALES_ORDER_STATE_PARAM)),
  };
}
