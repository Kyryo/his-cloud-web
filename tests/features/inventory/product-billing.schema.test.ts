import { describe, expect, it } from "vitest";

import {
  MAX_CHARGE_OCCURRENCES,
  MIN_CHARGE_OCCURRENCES,
  productBillingSchema,
} from "@/features/inventory/schemas/product-billing.schema";

describe("productBillingSchema", () => {
  it("accepts charge occurrences within the allowed range", () => {
    const result = productBillingSchema.safeParse({ charge_occurrences: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.charge_occurrences).toBe(3);
    }
  });

  it("defaults string coercion for minimum boundary", () => {
    const result = productBillingSchema.safeParse({
      charge_occurrences: String(MIN_CHARGE_OCCURRENCES),
    });
    expect(result.success).toBe(true);
  });

  it("rejects values below the minimum", () => {
    const result = productBillingSchema.safeParse({ charge_occurrences: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects values above the maximum", () => {
    const result = productBillingSchema.safeParse({
      charge_occurrences: MAX_CHARGE_OCCURRENCES + 1,
    });
    expect(result.success).toBe(false);
  });
});
