import { describe, expect, it } from "vitest";

import type { InventoryStock } from "@/features/inventory/types/inventory.types";
import {
  getStockLineOnHandValue,
  getStockQuantityStatus,
  getStockQuantityStatusLabel,
  LOW_STOCK_THRESHOLD,
  parseStockQuantity,
  summarizeStockItems,
} from "@/features/inventory/utils/stock-quantity-status";

function createStock(
  overrides: Partial<InventoryStock> = {},
): InventoryStock {
  return {
    id: 1,
    uuid: "stock-1",
    tenant: 1,
    location: 2,
    location_name: "Main store",
    product_id: 10,
    product_name: "Paracetamol 500mg",
    batch: 3,
    batch_number: "B-001",
    quantity_on_hand: 20,
    average_unit_cost: 5,
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

describe("stock-quantity-status", () => {
  it("parses numeric quantities and rejects empty values", () => {
    expect(parseStockQuantity("12.5")).toBe(12.5);
    expect(parseStockQuantity(0)).toBe(0);
    expect(parseStockQuantity("")).toBeNull();
    expect(parseStockQuantity("n/a")).toBeNull();
  });

  it("classifies on-hand quantity against the low-stock threshold", () => {
    expect(getStockQuantityStatus(0)).toBe("out");
    expect(getStockQuantityStatus(-1)).toBe("out");
    expect(getStockQuantityStatus(LOW_STOCK_THRESHOLD - 1)).toBe("low");
    expect(getStockQuantityStatus(LOW_STOCK_THRESHOLD)).toBe("ok");
    expect(getStockQuantityStatus(null)).toBe("unknown");
    expect(getStockQuantityStatusLabel("low")).toBe("Low stock");
  });

  it("computes line value from quantity and unit cost", () => {
    expect(getStockLineOnHandValue("8", "2.5")).toBe(20);
    expect(getStockLineOnHandValue("8", null)).toBeNull();
  });

  it("summarizes locations and quantity alerts for the loaded page", () => {
    const insights = summarizeStockItems([
      createStock({
        uuid: "ok",
        location_name: "Main store",
        quantity_on_hand: 40,
      }),
      createStock({
        uuid: "low",
        location_name: "Pharmacy",
        quantity_on_hand: 3,
      }),
      createStock({
        uuid: "out",
        location_name: " Main store ",
        quantity_on_hand: 0,
      }),
    ]);

    expect(insights).toEqual({
      lineCount: 3,
      locationCount: 2,
      outOfStockCount: 1,
      lowStockCount: 1,
    });
  });
});
