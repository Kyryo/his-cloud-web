import { describe, expect, it } from "vitest";

import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  formatSalesOrderInsurerDueLabel,
  hasSalesOrderPaymentSplit,
  sumSalesOrderClientDue,
  sumSalesOrderInsurerDue,
} from "@/features/sales-orders/utils/sum-sales-order-billing";

function buildOrder(overrides: Partial<SalesOrder> = {}): SalesOrder {
  return {
    id: 1,
    name: "SO001",
    date_order: null,
    state: "draft",
    invoice_status: "no",
    customer_id: 1,
    customer_uuid: null,
    customer_name: null,
    amount_untaxed: "100",
    amount_tax: "10",
    amount_total: "110",
    currency_code: "USD",
    pricelist_id: null,
    pricelist_name: null,
    clinic_id: null,
    clinic_name: null,
    visit_id: null,
    visit_uuid: null,
    provider_id: null,
    provider_name: null,
    insurance_scheme_id: null,
    insurance_scheme_name: null,
    insurance_company: null,
    insurance_number: null,
    insurance_number_prefix: null,
    authorization_number: null,
    lines: [],
    ...overrides,
  };
}

describe("sum-sales-order-billing", () => {
  it("sums insurer and client due across order lines", () => {
    const order = buildOrder({
      lines: [
        {
          id: 1,
          name: "Consultation",
          product_id: 10,
          quantity: 1,
          is_payable: true,
          insurer_due: "80",
          client_due: "20",
        },
        {
          id: 2,
          name: "Lab",
          product_id: 11,
          quantity: 2,
          is_payable: true,
          insurer_due: "50",
          client_due: "10",
        },
      ],
    });

    expect(sumSalesOrderInsurerDue(order)).toBe(130);
    expect(sumSalesOrderClientDue(order)).toBe(30);
  });

  it("formats insurer due label from insurance company", () => {
    const order = buildOrder({
      insurance_company: "Acme Health",
      insurance_scheme_name: "Gold",
    });

    expect(formatSalesOrderInsurerDueLabel(order)).toBe("Acme Health due");
  });

  it("falls back to insurance due when no insurer name is present", () => {
    expect(formatSalesOrderInsurerDueLabel(buildOrder())).toBe("Insurance due");
  });

  it("detects when an order has payment split lines", () => {
    expect(hasSalesOrderPaymentSplit(buildOrder())).toBe(false);
    expect(
      hasSalesOrderPaymentSplit(
        buildOrder({
          lines: [
            {
              id: 1,
              name: "Consultation",
              product_id: 10,
              quantity: 1,
              is_payable: true,
              insurer_due: "0",
              client_due: "0",
            },
          ],
        }),
      ),
    ).toBe(false);
    expect(
      hasSalesOrderPaymentSplit(
        buildOrder({
          lines: [
            {
              id: 1,
              name: "Consultation",
              product_id: 10,
              quantity: 1,
              is_payable: true,
              insurer_due: "80",
              client_due: "0",
            },
          ],
        }),
      ),
    ).toBe(true);
  });
});
