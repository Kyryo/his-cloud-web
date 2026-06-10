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
    partner_id: [42, "Ada Lovelace"],
    amount_untaxed: "10.00",
    amount_tax: "0.00",
    amount_total: "10.00",
    currency_id: [1, "USD"],
    pricelist_id: [2, "CASH Pricelist"],
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
    x_insurance_scheme_id: null,
    x_insurance_scheme_name: null,
    x_insurance_company: null,
    x_insurance_number: null,
    x_insurance_number_prefix: null,
    x_authorization_number: null,
    ...overrides,
  } as SalesOrder;
}

describe("formatSalesOrder display helpers", () => {
  it("formats clinic name with empty fallback", () => {
    expect(formatSalesOrderClinicName(createOrder())).toBe("Main Clinic");
    expect(
      formatSalesOrderClinicName(
        createOrder({ clinic_name: null, x_clinic_name: "Branch Clinic" }),
      ),
    ).toBe("Branch Clinic");
    expect(
      formatSalesOrderClinicName(createOrder({ clinic_name: null })),
    ).toBe("No clinic");
  });

  it("formats pricelist with empty fallback", () => {
    expect(formatSalesOrderPricelist(createOrder())).toBe("CASH Pricelist");
    expect(
      formatSalesOrderPricelist(createOrder({ pricelist_id: false })),
    ).toBe("No pricelist");
  });

  it("formats customer with empty fallback", () => {
    expect(formatSalesOrderCustomer(createOrder())).toBe("Ada Lovelace");
    expect(
      formatSalesOrderCustomer(createOrder({ partner_id: false })),
    ).toBe("No customer");
  });
});
