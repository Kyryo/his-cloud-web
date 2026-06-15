import { describe, expect, it } from "vitest";

import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  formatSalesOrderClinicName,
  formatSalesOrderCustomer,
  formatSalesOrderPricelist,
} from "@/features/sales-orders/utils/format-sales-order";

function createOrder(overrides: Partial<SalesOrder> = {}): SalesOrder {
  return {
    id: 1,
    name: "S00001",
    date_order: "2024-01-01T10:00:00Z",
    state: "sale",
    invoice_status: "no",
    customer_id: 42,
    customer_name: "Ada Lovelace",
    amount_untaxed: "10.00",
    amount_tax: "0.00",
    amount_total: "10.00",
    currency_code: "USD",
    pricelist_id: 2,
    pricelist_name: "CASH Pricelist",
    clinic_id: 10,
    clinic_name: "Main Clinic",
    visit_id: 99,
    visit_uuid: "visit-uuid",
    provider_id: null,
    provider_name: null,
    insurance_scheme_id: null,
    insurance_scheme_name: null,
    insurance_company: null,
    insurance_number: null,
    insurance_number_prefix: null,
    authorization_number: null,
    ...overrides,
  };
}

describe("formatSalesOrder display helpers", () => {
  it("formats clinic name with empty fallback", () => {
    expect(formatSalesOrderClinicName(createOrder())).toBe("Main Clinic");
    expect(formatSalesOrderClinicName(createOrder({ clinic_name: null }))).toBe(
      "No clinic",
    );
  });

  it("formats pricelist with empty fallback", () => {
    expect(formatSalesOrderPricelist(createOrder())).toBe("CASH Pricelist");
    expect(
      formatSalesOrderPricelist(createOrder({ pricelist_name: null })),
    ).toBe("No pricelist");
  });

  it("formats customer with empty fallback", () => {
    expect(formatSalesOrderCustomer(createOrder())).toBe("Ada Lovelace");
    expect(
      formatSalesOrderCustomer(createOrder({ customer_name: null })),
    ).toBe("No customer");
  });
});
