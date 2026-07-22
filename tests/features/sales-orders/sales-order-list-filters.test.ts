import { describe, expect, it } from "vitest";

import {
  buildSalesOrderListFilters,
  countActiveSalesOrderFilters,
  DEFAULT_SALES_ORDER_LIST_FILTERS,
} from "@/features/sales-orders/utils/sales-order-list-filters";

describe("sales order list filters", () => {
  it("builds API filters from search and sheet state", () => {
    expect(
      buildSalesOrderListFilters({
        search: "S00081",
        page: 1,
        pageSize: 20,
        filters: {
          ...DEFAULT_SALES_ORDER_LIST_FILTERS,
          state: "sale",
          invoiceStatus: "invoiced",
          dateFrom: "2024-01-01",
          dateTo: "2024-12-31",
        },
      }),
    ).toEqual({
      page: 1,
      pageSize: 20,
      search: "S00081",
      state: "sale",
      invoiceStatus: "invoiced",
      dateFrom: "2024-01-01",
      dateTo: "2024-12-31",
    });
  });

  it("counts active filters", () => {
    expect(countActiveSalesOrderFilters(DEFAULT_SALES_ORDER_LIST_FILTERS)).toBe(0);
    expect(
      countActiveSalesOrderFilters({
        ...DEFAULT_SALES_ORDER_LIST_FILTERS,
        state: "draft",
        dateFrom: "2024-01-01",
      }),
    ).toBe(2);
  });
});
