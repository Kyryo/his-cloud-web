import { describe, expect, it } from "vitest";

import {
  createEmptySalesOrderLineDraft,
  validateSalesOrderLinesForSave,
} from "@/features/sales-orders/types/sales-order-line-draft";
import {
  buildSalesOrderLineCreatePayload,
  collectSalesOrderLinesToAdd,
} from "@/features/sales-orders/utils/sales-order-lines-save";

describe("validateSalesOrderLinesForSave", () => {
  it("rejects blank new lines that were never filled in", () => {
    const draft = createEmptySalesOrderLineDraft();

    expect(validateSalesOrderLinesForSave([draft])).toBe(
      "Confirm or remove new line items before saving.",
    );
  });

  it("allows saving new lines once a product is selected", () => {
    const draft = {
      ...createEmptySalesOrderLineDraft(),
      product_uuid: "11111111-1111-1111-1111-111111111111",
      productName: "Consultation",
      quantity: "1",
      price_unit: "10",
    };

    expect(validateSalesOrderLinesForSave([draft])).toBeNull();
  });

  it("rejects lines with a product label but no product reference", () => {
    const draft = {
      ...createEmptySalesOrderLineDraft(),
      isNew: false,
      productName: "Consultation",
      quantity: "1",
      price_unit: "10",
    };

    expect(validateSalesOrderLinesForSave([draft])).toBe(
      "Each line item must have a product selected.",
    );
  });

  it("accepts lines identified by product_uuid only", () => {
    const draft = {
      ...createEmptySalesOrderLineDraft(),
      isNew: false,
      product_uuid: "11111111-1111-1111-1111-111111111111",
      productName: "Consultation",
      quantity: "1",
      price_unit: "10",
    };

    expect(validateSalesOrderLinesForSave([draft])).toBeNull();
  });
});

describe("collectSalesOrderLinesToAdd", () => {
  it("skips lines without a product reference", () => {
    const draft = {
      ...createEmptySalesOrderLineDraft(),
      isNew: false,
      productName: "Consultation",
      quantity: "1",
      price_unit: "10",
    };

    expect(collectSalesOrderLinesToAdd([draft], new Set())).toEqual([]);
  });

  it("includes confirmed new lines with a product_uuid", () => {
    const draft = {
      ...createEmptySalesOrderLineDraft(),
      isNew: false,
      product_uuid: "11111111-1111-1111-1111-111111111111",
      productName: "Consultation",
      quantity: "1",
      price_unit: "10",
    };

    expect(collectSalesOrderLinesToAdd([draft], new Set())).toEqual([draft]);
  });
});

describe("buildSalesOrderLineCreatePayload", () => {
  it("builds the API payload from a uuid-only draft line", () => {
    const draft = {
      ...createEmptySalesOrderLineDraft(),
      isNew: false,
      product_uuid: "11111111-1111-1111-1111-111111111111",
      quantity: "2",
      price_unit: "15.5",
      tariff_code: "T001",
    };

    expect(buildSalesOrderLineCreatePayload(draft)).toEqual({
      product_uuid: "11111111-1111-1111-1111-111111111111",
      quantity: "2.0000",
      price_unit: "15.5000",
      tariff_code: "T001",
    });
  });

  it("builds the API payload from a draft line with product_id", () => {
    const draft = {
      ...createEmptySalesOrderLineDraft(),
      isNew: false,
      product_id: 12,
      quantity: "2",
      price_unit: "15.5",
      tariff_code: "T001",
    };

    expect(buildSalesOrderLineCreatePayload(draft)).toEqual({
      product_id: 12,
      quantity: "2.0000",
      price_unit: "15.5000",
      tariff_code: "T001",
    });
  });
});
