import { describe, expect, it } from "vitest";

import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  isSalesOrderLineNonPayable,
  orderHasPricelist,
  resolveInitialLineIsPayable,
} from "@/features/sales-orders/utils/sales-order-line-payability";

const baseOrder = {
  id: 1,
  name: "SO001",
  date_order: null,
  state: "draft",
  invoice_status: "no",
  customer_id: 1,
  customer_uuid: null,
  customer_name: null,
  amount_untaxed: null,
  amount_tax: null,
  amount_total: null,
  currency_code: null,
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
} satisfies SalesOrder;

describe("sales-order-line-payability", () => {
  it("detects when an order has a related pricelist", () => {
    expect(orderHasPricelist(baseOrder)).toBe(false);
    expect(
      orderHasPricelist({ ...baseOrder, pricelist_id: 12, pricelist_name: "MASM" }),
    ).toBe(true);
  });

  it("marks lines as non-payable only when the order has a pricelist", () => {
    expect(isSalesOrderLineNonPayable(baseOrder, { is_payable: false })).toBe(false);
    expect(
      isSalesOrderLineNonPayable(
        { ...baseOrder, pricelist_id: 12 },
        { is_payable: false },
      ),
    ).toBe(true);
    expect(
      isSalesOrderLineNonPayable(
        { ...baseOrder, pricelist_id: 12 },
        { is_payable: true },
      ),
    ).toBe(false);
  });

  it("resolves initial draft payability from pricelist membership", () => {
    expect(
      resolveInitialLineIsPayable({ ...baseOrder, pricelist_id: 12 }, true),
    ).toBe(true);
    expect(
      resolveInitialLineIsPayable({ ...baseOrder, pricelist_id: 12 }, false),
    ).toBe(false);
    expect(resolveInitialLineIsPayable(baseOrder, false)).toBeUndefined();
  });
});
