import { describe, expect, it } from "vitest";

import {
  calculateSalesOrderLineDraftTotal,
  createEmptySalesOrderLineDraft,
  salesOrderLineDraftNeedsReplace,
  serializeSalesOrderDraftLines,
  validateSalesOrderLinesForSave,
} from "@/features/sales-orders/types/sales-order-line-draft";

describe("sales-order-line-draft", () => {
  it("creates an empty draft line flagged as new", () => {
    const draft = createEmptySalesOrderLineDraft();

    expect(draft.isNew).toBe(true);
    expect(draft.product_id).toBeNull();
    expect(draft.quantity).toBe("1");
  });

  it("calculates draft line totals from quantity and unit price", () => {
    const draft = {
      ...createEmptySalesOrderLineDraft(),
      quantity: "2",
      price_unit: "12.5",
    };

    expect(calculateSalesOrderLineDraftTotal(draft)).toBe(25);
  });

  it("serializes draft lines for change detection", () => {
    const draft = {
      ...createEmptySalesOrderLineDraft(),
      id: 8,
      isNew: false,
      product_id: 12,
      productName: "Consultation",
      quantity: "1",
      price_unit: "10",
    };

    expect(serializeSalesOrderDraftLines([draft])).toBe(
      JSON.stringify([
        {
          id: 8,
          product_id: 12,
          productName: "Consultation",
          tariff_code: null,
          quantity: "1",
          price_unit: "10",
          price_total: null,
        },
      ]),
    );
  });

  it("detects when an existing line needs delete-and-readd", () => {
    const original = {
      product_id: 12,
      quantity: "1",
    };

    expect(
      salesOrderLineDraftNeedsReplace(original, {
        product_id: 12,
        quantity: "2",
      }),
    ).toBe(true);
    expect(
      salesOrderLineDraftNeedsReplace(original, {
        product_id: 15,
        quantity: "1",
      }),
    ).toBe(true);
    expect(
      salesOrderLineDraftNeedsReplace(original, {
        product_id: 12,
        quantity: "1",
      }),
    ).toBe(false);
  });

  it("accepts lines identified by product_uuid only", () => {
    const draft = {
      ...createEmptySalesOrderLineDraft(),
      isNew: false,
      product_uuid: "11111111-1111-1111-1111-111111111111",
      productName: "Consultation",
      quantity: "1",
      price_unit: "10",
    };

    expect(validateSalesOrderLinesForSave([draft])).toBeNull();
  });
});
