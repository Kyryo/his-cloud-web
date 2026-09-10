import { describe, expect, it } from "vitest";

import {
  getInventoryMarkWash,
  INVENTORY_MARK_KIND_WASH,
} from "@/features/inventory/utils/inventory-mark";

describe("inventory-mark", () => {
  it("keeps a stable wash for the same product seed", () => {
    expect(getInventoryMarkWash("product", "Paracetamol 500mg")).toBe(
      getInventoryMarkWash("product", "Paracetamol 500mg"),
    );
    expect(getInventoryMarkWash("product", "Paracetamol 500mg")).not.toBe(
      getInventoryMarkWash("product", "Amoxicillin"),
    );
  });

  it("uses a fixed wash per document kind", () => {
    expect(getInventoryMarkWash("purchase-order", "PO-1")).toBe(
      INVENTORY_MARK_KIND_WASH["purchase-order"],
    );
    expect(getInventoryMarkWash("adjustment", "ADJ-1")).toBe(
      INVENTORY_MARK_KIND_WASH.adjustment,
    );
  });
});
