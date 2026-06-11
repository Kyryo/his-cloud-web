import { describe, expect, it } from "vitest";

import {
  calculateDraftsTotal,
  calculateLineDraftTotal,
  createEmptyPurchaseOrderLineDraft,
  draftsToPurchaseOrderLines,
  purchaseOrderLineToDraft,
  validatePurchaseOrderLinesForSubmit,
} from "@/features/inventory/types/purchase-order-line-draft";

describe("purchase-order-line-draft utils", () => {
  it("creates an empty draft row for new lines", () => {
    const draft = createEmptyPurchaseOrderLineDraft();

    expect(draft.odoo_product_id).toBeNull();
    expect(draft.isNew).toBe(true);
  });

  it("maps saved lines to editable drafts", () => {
    const draft = purchaseOrderLineToDraft({
      id: 1,
      odoo_product_id: 42,
      quantity: "3",
      unit_cost: "12.5",
    });

    expect(draft.odoo_product_id).toBe(42);
    expect(draft.quantity).toBe("3");
    expect(draft.unit_cost).toBe("12.5");
  });

  it("calculates line and order totals", () => {
    const draft = {
      ...createEmptyPurchaseOrderLineDraft(),
      odoo_product_id: 10,
      quantity: "2",
      unit_cost: "5",
    };

    expect(calculateLineDraftTotal(draft)).toBe(10);
    expect(calculateDraftsTotal([draft])).toBe(10);
  });

  it("filters incomplete drafts before saving", () => {
    const lines = draftsToPurchaseOrderLines([
      {
        key: "a",
        odoo_product_id: 10,
        productName: "A",
        quantity: "2",
        unit_cost: "5",
      },
      {
        key: "b",
        odoo_product_id: null,
        productName: null,
        quantity: "1",
        unit_cost: "0",
      },
    ]);

    expect(lines).toEqual([
      {
        odoo_product_id: 10,
        quantity: "2",
        unit_cost: "5",
      },
    ]);
  });

  it("blocks submit when quantity or unit cost is zero", () => {
    expect(
      validatePurchaseOrderLinesForSubmit([
        {
          key: "a",
          odoo_product_id: 1,
          productName: "Item",
          quantity: "0",
          unit_cost: "10",
        },
      ]),
    ).toContain("greater than zero");

    expect(
      validatePurchaseOrderLinesForSubmit([
        {
          key: "a",
          odoo_product_id: 1,
          productName: "Item",
          quantity: "2",
          unit_cost: "0",
        },
      ]),
    ).toContain("greater than zero");
  });

  it("requires at least one line item before submit", () => {
    expect(validatePurchaseOrderLinesForSubmit([])).toContain("at least one");
  });
});
