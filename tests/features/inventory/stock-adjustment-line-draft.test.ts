import { describe, expect, it } from "vitest";

import {
  createEmptyStockAdjustmentLineDraft,
  draftsToStockAdjustmentLines,
  preserveStockAdjustmentProductNames,
} from "@/features/inventory/types/stock-adjustment-line-draft";

describe("preserveStockAdjustmentProductNames", () => {
  it("preserves the selected name and UUID after save", () => {
    const previous = [
      {
        ...createEmptyStockAdjustmentLineDraft(),
        product_id: 2,
        product_uuid: "product-uuid",
        productName: "Paracetamol 500mg",
        quantity_delta: "5",
        isNew: false,
      },
    ];
    const responseDrafts = [
      {
        ...createEmptyStockAdjustmentLineDraft(),
        id: 10,
        product_id: 2,
        product_uuid: null,
        productName: null,
        quantity_delta: "5",
        isNew: false,
      },
    ];

    expect(
      preserveStockAdjustmentProductNames(responseDrafts, previous),
    ).toEqual([
      {
        ...responseDrafts[0],
        product_uuid: "product-uuid",
        productName: "Paracetamol 500mg",
      },
    ]);
  });
});

describe("draftsToStockAdjustmentLines", () => {
  it("allows an empty replacement payload after all lines are removed", () => {
    expect(draftsToStockAdjustmentLines([], "QUANTITY")).toEqual([]);
  });
});
