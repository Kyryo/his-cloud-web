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
    partner_id: [42, "Ada Lovelace"],
    amount_untaxed: "10.00",
    amount_tax: "0.00",
    amount_total: "10.00",
    currency_id: [1, "USD"],
    pricelist_id: [2, "Insurance Pricelist"],
    company_id: [3, "Sigma HMIS"],
    user_id: [4, "Dr. Smith"],
    x_hmis_tenant_id: 1,
    x_clinic_id: 10,
    clinic_name: "Main Clinic",
    x_visit_id: 99,
    x_hmis_visit_uuid: "visit-uuid",
    x_hmis_customer_id: 7,
    x_hmis_customer_uuid: "customer-uuid",
    x_hmis_provider_id: null,
    x_hmis_provider_name: null,
    x_visit_pricelist_id: null,
    x_insurance_scheme_id: 1,
    x_insurance_scheme_name: "Gold Plan",
    x_insurance_company: "Acme Insurance",
    x_insurance_number: "12345",
    x_insurance_number_prefix: "A-",
    x_authorization_number: null,
    ...overrides,
  } as SalesOrder;
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
          x_insurance_company: null,
          x_insurance_scheme_name: null,
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
