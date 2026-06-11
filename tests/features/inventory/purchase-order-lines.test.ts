import { describe, expect, it } from "vitest";

import {
  draftsToPurchaseOrderLines,
  purchaseOrderLinesToDrafts,
} from "@/features/inventory/utils/purchase-order-lines";

describe("purchase-order-lines utils", () => {
  it("returns an empty draft row when there are no lines", () => {
    const drafts = purchaseOrderLinesToDrafts([]);

    expect(drafts).toHaveLength(1);
    expect(drafts[0]?.odoo_product_id).toBeNull();
  });

  it("maps existing lines to editable drafts", () => {
    const drafts = purchaseOrderLinesToDrafts([
      {
        id: 1,
        odoo_product_id: 42,
        quantity: "3",
        unit_cost: "12.5",
      },
    ]);

    expect(drafts).toHaveLength(1);
    expect(drafts[0]?.odoo_product_id).toBe(42);
    expect(drafts[0]?.quantity).toBe("3");
    expect(drafts[0]?.unit_cost).toBe("12.5");
  });

  it("filters incomplete drafts before saving", () => {
    const lines = draftsToPurchaseOrderLines([
      {
        key: "a",
        odoo_product_id: 10,
        quantity: "2",
        unit_cost: "5",
      },
      {
        key: "b",
        odoo_product_id: null,
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
});
