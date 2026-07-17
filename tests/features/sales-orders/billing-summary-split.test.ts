import { describe, expect, it } from "vitest";

import { SPLIT_ROUNDING_TOLERANCE } from "@/features/sales-orders/utils/sales-order-line-split-mismatch";

function amountsReconcile(left: number, right: number): boolean {
  return Math.abs(left - right) <= SPLIT_ROUNDING_TOLERANCE;
}

describe("billing summary split validation", () => {
  it("accepts values that sum to the order total within tolerance", () => {
    expect(amountsReconcile(40.005 + 79.995, 120)).toBe(true);
    expect(amountsReconcile(40 + 80, 120)).toBe(true);
  });

  it("rejects values that do not sum to the order total", () => {
    expect(amountsReconcile(40 + 70, 120)).toBe(false);
  });
});
