import { describe, expect, it } from "vitest";

import { canEditSalesOrderLines } from "@/features/sales-orders/utils/sales-order-status";

describe("canEditSalesOrderLines", () => {
  it("allows editing draft and sent orders", () => {
    expect(canEditSalesOrderLines("draft")).toBe(true);
    expect(canEditSalesOrderLines("sent")).toBe(true);
  });

  it("blocks editing confirmed or cancelled orders", () => {
    expect(canEditSalesOrderLines("sale")).toBe(false);
    expect(canEditSalesOrderLines("done")).toBe(false);
    expect(canEditSalesOrderLines("cancel")).toBe(false);
  });
});
