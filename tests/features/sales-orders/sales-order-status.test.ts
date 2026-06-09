import { describe, expect, it } from "vitest";

import {
  formatSalesOrderInvoiceStatusLabel,
  formatSalesOrderStateLabel,
  getSalesOrderStateBadgeVariant,
} from "@/features/sales-orders/utils/sales-order-status";

describe("sales order status utils", () => {
  it("formats order state labels", () => {
    expect(formatSalesOrderStateLabel("draft")).toBe("Draft");
    expect(formatSalesOrderStateLabel("sale")).toBe("Confirmed");
    expect(formatSalesOrderStateLabel("cancel")).toBe("Cancelled");
  });

  it("formats invoice status labels", () => {
    expect(formatSalesOrderInvoiceStatusLabel("no")).toBe("Nothing to invoice");
    expect(formatSalesOrderInvoiceStatusLabel("to invoice")).toBe("To invoice");
    expect(formatSalesOrderInvoiceStatusLabel("invoiced")).toBe("Fully invoiced");
  });

  it("maps state to badge variants", () => {
    expect(getSalesOrderStateBadgeVariant("sale")).toBe("success");
    expect(getSalesOrderStateBadgeVariant("cancel")).toBe("destructive");
  });
});
