import { describe, expect, it } from "vitest";

import {
  createInternalOrderDefaultValues,
  createInternalOrderSchema,
  toCreateInternalOrderPayload,
} from "@/features/inventory/schemas/internal-order.schema";

describe("createInternalOrderSchema", () => {
  it("accepts valid locations", () => {
    const result = createInternalOrderSchema.safeParse({
      source_location: 1,
      destination_location: 2,
      notes: "Urgent transfer",
    });

    expect(result.success).toBe(true);
  });

  it("rejects matching source and destination", () => {
    const result = createInternalOrderSchema.safeParse({
      source_location: 1,
      destination_location: 1,
    });

    expect(result.success).toBe(false);
  });
});

describe("toCreateInternalOrderPayload", () => {
  it("maps form values to an empty-lines create payload", () => {
    expect(
      toCreateInternalOrderPayload({
        ...createInternalOrderDefaultValues(),
        source_location: 3,
        destination_location: 5,
        notes: "  Rush  ",
      }),
    ).toEqual({
      source_location: 3,
      destination_location: 5,
      notes: "Rush",
      lines: [],
    });
  });
});
