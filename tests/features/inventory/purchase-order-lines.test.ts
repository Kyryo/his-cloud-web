import { describe, expect, it } from "vitest";

import {
  calculateDraftsTotal,
  calculateLineDraftTotal,
  countLinesMissingBatchOrExpiry,
  countLinesWithValidationIssues,
  getLineValidationIssues,
  createEmptyPurchaseOrderLineDraft,
  draftsToPurchaseOrderLines,
  linesMissingProductName,
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
    expect(draft.productName).toBeNull();
  });

  it("uses cached product_name from the purchase order line", () => {
    const draft = purchaseOrderLineToDraft({
      id: 1,
      odoo_product_id: 42,
      product_name: "Paracetamol 500mg",
      quantity: "3",
      unit_cost: "12.5",
    });

    expect(draft.productName).toBe("Paracetamol 500mg");
  });

  it("detects when product names still need hydration", () => {
    expect(
      linesMissingProductName([
        {
          key: "a",
          odoo_product_id: 1,
          productName: "Paracetamol 500mg",
          quantity: "1",
          unit_cost: "10",
        },
      ]),
    ).toBe(false);

    expect(
      linesMissingProductName([
        {
          key: "a",
          odoo_product_id: 1,
          productName: null,
          quantity: "1",
          unit_cost: "10",
        },
      ]),
    ).toBe(true);
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

  it("maps batch and expiry fields from purchase order lines", () => {
    const draft = purchaseOrderLineToDraft({
      id: 1,
      odoo_product_id: 42,
      product_name: "Paracetamol 500mg",
      batch: 7,
      batch_number: "LOT-001",
      expiry_date: "2026-12-31",
      quantity: "3",
      unit_cost: "12.5",
    });

    expect(draft.batch).toBe(7);
    expect(draft.batchNumber).toBe("LOT-001");
    expect(draft.expiry_date).toBe("2026-12-31");
  });

  it("collects validation issues for incomplete lines", () => {
    expect(
      getLineValidationIssues(
        {
          key: "a",
          odoo_product_id: 1,
          productName: "Item",
          quantity: "0",
          unit_cost: "10",
          batch: 2,
          expiry_date: "2026-12-31",
        },
        { batchTrackingEnabled: true },
      ),
    ).toContain("quantity");

    expect(
      countLinesWithValidationIssues(
        [
          {
            key: "a",
            odoo_product_id: 1,
            productName: "Item",
            quantity: "2",
            unit_cost: "10",
            batch: 2,
            expiry_date: "2026-12-31",
          },
          {
            key: "b",
            odoo_product_id: 2,
            productName: "Item 2",
            quantity: "1",
            unit_cost: "5",
          },
        ],
        { batchTrackingEnabled: true },
      ),
    ).toBe(1);
  });

  it("ignores batch validation when clinic batch tracking is disabled", () => {
    expect(
      getLineValidationIssues({
        key: "a",
        odoo_product_id: 1,
        productName: "Item",
        quantity: "2",
        unit_cost: "10",
      }),
    ).toEqual([]);

    expect(
      countLinesMissingBatchOrExpiry([
        {
          odoo_product_id: 3,
          batch: null,
          expiry_date: null,
        },
      ]),
    ).toBe(0);
  });

  it("counts lines missing batch or expiry when tracking is enabled", () => {
    expect(
      countLinesMissingBatchOrExpiry(
        [
          {
            odoo_product_id: 1,
            batch: 2,
            expiry_date: "2026-12-31",
          },
          {
            odoo_product_id: 3,
            batch: null,
            expiry_date: null,
          },
        ],
        { batchTrackingEnabled: true },
      ),
    ).toBe(1);
  });

  it("includes batch and expiry when saving line drafts", () => {
    const lines = draftsToPurchaseOrderLines([
      {
        key: "a",
        odoo_product_id: 10,
        productName: "A",
        quantity: "2",
        unit_cost: "5",
        batch: 3,
        expiry_date: "2026-06-30",
      },
    ]);

    expect(lines).toEqual([
      {
        odoo_product_id: 10,
        quantity: "2",
        unit_cost: "5",
        batch: 3,
        expiry_date: "2026-06-30",
        notes: null,
      },
    ]);
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
        batch: null,
        expiry_date: null,
        notes: null,
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
