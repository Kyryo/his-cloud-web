import { describe, expect, it } from "vitest";

import type {
  SalesOrder,
  SalesOrderLine,
} from "@/features/sales-orders/types/sales-order.types";
import { findSalesOrderLinesNeedingTeethAssignment } from "@/features/sales-orders/utils/sales-order-line-teeth";

function line(overrides: Partial<SalesOrderLine> = {}): SalesOrderLine {
  return {
    id: 1,
    name: "Extraction",
    product_id: 10,
    quantity: "1",
    is_payable: true,
    is_procedure: true,
    dental: [],
    ...overrides,
  };
}

function order(overrides: Partial<SalesOrder> = {}): SalesOrder {
  return {
    id: 100,
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
    currency_code: "MWK",
    pricelist_id: null,
    pricelist_name: null,
    clinic_id: null,
    clinic_name: null,
    visit_id: 1,
    visit_uuid: "visit-1",
    provider_id: null,
    provider_name: null,
    insurance_scheme_id: null,
    insurance_scheme_name: null,
    insurance_company: null,
    insurance_number: null,
    insurance_number_prefix: null,
    authorization_number: null,
    has_dental_encounter: true,
    lines: [line()],
    ...overrides,
  };
}

describe("findSalesOrderLinesNeedingTeethAssignment", () => {
  it("returns new procedure lines without teeth on dental visits", () => {
    const result = findSalesOrderLinesNeedingTeethAssignment({
      order: order({
        lines: [line({ id: 5 }), line({ id: 6, is_procedure: false })],
      }),
      previousLineIds: [],
    });
    expect(result.map((item) => item.id)).toEqual([5]);
  });

  it("skips non-dental visits", () => {
    const result = findSalesOrderLinesNeedingTeethAssignment({
      order: order({ has_dental_encounter: false }),
      previousLineIds: [],
    });
    expect(result).toEqual([]);
  });

  it("skips lines that already existed before save", () => {
    const result = findSalesOrderLinesNeedingTeethAssignment({
      order: order({ lines: [line({ id: 5 })] }),
      previousLineIds: [5],
    });
    expect(result).toEqual([]);
  });

  it("skips lines that already have teeth", () => {
    const result = findSalesOrderLinesNeedingTeethAssignment({
      order: order({
        lines: [line({ id: 5, dental: [{ id: 1, tooth_number: 16 }] })],
      }),
      previousLineIds: [],
    });
    expect(result).toEqual([]);
  });

  it("includes non-payable procedure lines (teeth are still assigned on the SO)", () => {
    const result = findSalesOrderLinesNeedingTeethAssignment({
      order: order({
        lines: [line({ id: 5, is_payable: false })],
      }),
      previousLineIds: [],
    });
    expect(result.map((item) => item.id)).toEqual([5]);
  });
});
