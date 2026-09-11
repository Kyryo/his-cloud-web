import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import { DEFAULT_SALES_ORDER_LIST_FILTERS } from "@/features/sales-orders/utils/sales-order-list-filters";
import {
  filtersFromSalesOrderSearchParams,
  parseSalesOrderPage,
  parseSalesOrderState,
  salesOrdersHref,
} from "@/features/sales-orders/utils/sales-order-list-url";

describe("sales order list URL", () => {
  it("defaults page and state", () => {
    expect(parseSalesOrderPage("0")).toBe(1);
    expect(parseSalesOrderPage("4")).toBe(4);
    expect(parseSalesOrderState("sale")).toBe("sale");
    expect(parseSalesOrderState("unknown")).toBe("all");
  });

  it("builds compact hrefs and reads state from search params", () => {
    expect(salesOrdersHref()).toBe(ROUTES.salesOrders);
    expect(
      salesOrdersHref({
        search: "SO001",
        page: 2,
        newOrder: true,
        filters: { ...DEFAULT_SALES_ORDER_LIST_FILTERS, state: "draft" },
      }),
    ).toBe(`${ROUTES.salesOrders}?q=SO001&page=2&new=1&state=draft`);

    expect(
      filtersFromSalesOrderSearchParams(new URLSearchParams("state=done")),
    ).toEqual({
      ...DEFAULT_SALES_ORDER_LIST_FILTERS,
      state: "done",
    });
  });
});
