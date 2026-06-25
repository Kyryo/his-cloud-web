import { describe, expect, it } from "vitest";

import { mapProductWritePayload } from "@/features/catalog/utils/catalog-product-payload";

describe("mapProductWritePayload", () => {
  it("includes charge_occurrences for partial billing updates", () => {
    expect(mapProductWritePayload({ charge_occurrences: 4 })).toEqual({
      charge_occurrences: 4,
    });
  });

  it("omits undefined scalar fields", () => {
    expect(
      mapProductWritePayload({
        name: "Consultation",
        charge_occurrences: 2,
      }),
    ).toEqual({
      name: "Consultation",
      charge_occurrences: 2,
    });
  });

  it("includes metadata flags only when provided", () => {
    expect(
      mapProductWritePayload({
        name: "Drug A",
        is_drug: true,
        liquid_or_cream: false,
      }),
    ).toEqual({
      name: "Drug A",
      metadata: {
        is_drug: true,
        liquid_or_cream: false,
      },
    });
  });
});
