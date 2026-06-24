import { describe, expect, it } from "vitest";

import {
  createBatchDefaultValues,
  createBatchSchema,
  toCreateBatchPayload,
} from "@/features/inventory/schemas/batch.schema";

describe("createBatchSchema", () => {
  it("accepts valid batch details", () => {
    const result = createBatchSchema.safeParse({
      product_uuid: "e748a47f-ef61-40a2-b85a-51b34fbc6ae9",
      batch_number: "LOT-1",
      supplier: "Onions Pharma",
      notes: "Cold storage",
    });

    expect(result.success).toBe(true);
  });

  it("requires supplier", () => {
    const result = createBatchSchema.safeParse({
      product_uuid: "e748a47f-ef61-40a2-b85a-51b34fbc6ae9",
      batch_number: "LOT-1",
      supplier: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("toCreateBatchPayload", () => {
  it("never sends null supplier", () => {
    expect(
      toCreateBatchPayload(
        {
          ...createBatchDefaultValues(),
          product_uuid: "e748a47f-ef61-40a2-b85a-51b34fbc6ae9",
          batch_number: "LOT-1",
          supplier: "Onions Pharma",
        },
        1,
      ),
    ).toEqual({
      tenant: 1,
      product_uuid: "e748a47f-ef61-40a2-b85a-51b34fbc6ae9",
      batch_number: "LOT-1",
      expiry_date: null,
      manufacture_date: null,
      supplier: "Onions Pharma",
      notes: null,
    });
  });
});
