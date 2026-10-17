import { describe, expect, it } from "vitest";

import {
  mergePreviewForSelection,
  savedSelectableLines,
} from "@/features/sales-orders/utils/sales-order-line-selection";

const filling = {
  id: 1,
  product_id: 10,
  productName: "FCB (3 Part)",
  provider_id: 4,
  is_payable: true,
  payability_overridden: false,
  quantity: "1",
};

describe("sales order line selection", () => {
  it("ignores unsaved rows", () => {
    const saved = savedSelectableLines([
      filling,
      { ...filling, id: undefined, isNew: true },
    ]);

    expect(saved).toEqual([filling]);
  });

  it("previews a merge only for matching saved lines", () => {
    const second = { ...filling, id: 2, quantity: "2" };

    expect(mergePreviewForSelection([filling, second], [1])).toBeNull();
    expect(mergePreviewForSelection([filling, second], [1, 2])).toEqual({
      productName: "FCB (3 Part)",
      quantity: 3,
      lineIds: [1, 2],
    });
    expect(
      mergePreviewForSelection(
        [filling, { ...second, product_id: 11, productName: "Consultation" }],
        [1, 2],
      ),
    ).toBeNull();
    expect(
      mergePreviewForSelection(
        [filling, { ...second, provider_id: null }],
        [1, 2],
      ),
    ).toBeNull();
    expect(
      mergePreviewForSelection(
        [filling, { ...second, is_payable: false, payability_overridden: true }],
        [1, 2],
      ),
    ).toBeNull();
  });
});
