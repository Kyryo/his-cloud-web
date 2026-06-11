import { describe, expect, it } from "vitest";

import {
  formatProcedureScopeLabel,
  formatProductTypeLabel,
  getProductTypeBadgeVariant,
} from "@/features/inventory/utils/format-inventory";

describe("format-product", () => {
  it("formats product type labels from API fields", () => {
    expect(
      formatProductTypeLabel({
        product_type_label: "stockable",
        product_type: "product",
      }),
    ).toBe("Stockable");

    expect(
      formatProductTypeLabel({
        product_type: "consu",
      }),
    ).toBe("Consumable");
  });

  it("maps badge variants by product type label", () => {
    expect(getProductTypeBadgeVariant("stockable")).toBe("default");
    expect(getProductTypeBadgeVariant("service")).toBe("outline");
  });

  it("formats procedure scope from x_meta", () => {
    expect(
      formatProcedureScopeLabel({
        is_procedure: true,
        opd_only_procedure: true,
      }),
    ).toBe("OPD only");
  });
});
