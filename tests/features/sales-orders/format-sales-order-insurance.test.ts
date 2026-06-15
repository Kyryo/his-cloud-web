import { describe, expect, it } from "vitest";

import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  formatSalesOrderInsuranceLabel,
  formatSalesOrderInsuranceNumber,
} from "@/features/sales-orders/utils/format-sales-order-insurance";

function createOrder(overrides: Partial<SalesOrder> = {}): SalesOrder {
  return {
    id: 1,
    name: "S00001",
    date_order: "2024-01-01T10:00:00Z",
    state: "sale",
    invoice_status: "no",
    customer_id: 42,
    customer_uuid: "customer-uuid",
    customer_name: "Ada Lovelace",
    amount_untaxed: "10.00",
    amount_tax: "0.00",
    amount_total: "10.00",
    currency_code: "USD",
    pricelist_id: 2,
    pricelist_name: "Insurance Pricelist",
    clinic_id: 10,
    clinic_name: "Main Clinic",
    visit_id: 99,
    visit_uuid: "visit-uuid",
    provider_id: null,
    provider_name: null,
    insurance_scheme_id: 1,
    insurance_scheme_name: "Gold Plan",
    insurance_company: "Acme Insurance",
    insurance_number: "12345",
    insurance_number_prefix: "A-",
    authorization_number: null,
    ...overrides,
  };
}

describe("formatSalesOrderInsuranceLabel", () => {
  it("combines company and scheme with a dash", () => {
    expect(formatSalesOrderInsuranceLabel(createOrder())).toBe(
      "Acme Insurance - Gold Plan",
    );
  });

  it("returns a dash when insurance details are missing", () => {
    expect(
      formatSalesOrderInsuranceLabel(
        createOrder({
          insurance_company: null,
          insurance_scheme_name: null,
        }),
      ),
    ).toBe("—");
  });
});

describe("formatSalesOrderInsuranceNumber", () => {
  it("combines prefix and membership number", () => {
    expect(formatSalesOrderInsuranceNumber(createOrder())).toBe("A-12345");
  });
});
