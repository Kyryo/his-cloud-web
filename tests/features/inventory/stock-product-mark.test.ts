import { describe, expect, it } from "vitest";

import { getStockProductDisplayName } from "@/features/inventory/utils/stock-product-mark";

describe("stock-product-mark", () => {
  it("falls back to a product id when the name is missing", () => {
    expect(getStockProductDisplayName("  ", 12)).toBe("Product 12");
    expect(getStockProductDisplayName("ORS sachets", 12)).toBe("ORS sachets");
  });
});
