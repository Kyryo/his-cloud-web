import { describe, expect, it } from "vitest";

import {
  canConvertSalesOrderToInvoice,
  formatSalesOrderInvoiceStatusLabel,
  formatSalesOrderStateLabel,
  getConvertSalesOrderToInvoiceDisabledReason,
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

  it("determines when a sales order can be converted to an invoice", () => {
    const baseOrder = {
      state: "sale" as const,
      invoice_status: "to invoice" as const,
      order_lines: [{ id: 1, name: "Consultation" }],
    };

    expect(canConvertSalesOrderToInvoice(baseOrder)).toBe(true);
    expect(getConvertSalesOrderToInvoiceDisabledReason(baseOrder)).toBeNull();

    expect(
      canConvertSalesOrderToInvoice({ ...baseOrder, invoice_status: "invoiced" }),
    ).toBe(false);
    expect(
      getConvertSalesOrderToInvoiceDisabledReason({
        ...baseOrder,
        state: "cancel",
      }),
    ).toContain("Cancelled");
    expect(
      getConvertSalesOrderToInvoiceDisabledReason({ ...baseOrder, order_lines: [] }),
    ).toContain("line item");
  });
});
