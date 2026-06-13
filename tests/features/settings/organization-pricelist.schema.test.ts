import { describe, expect, it } from "vitest";

import {
  createOrganizationPricelistSchema,
  toCreateOrganizationPricelistPayload,
} from "@/features/settings/schemas/organization-pricelist.schema";

describe("createOrganizationPricelistSchema", () => {
  it("requires a pricelist name", () => {
    const result = createOrganizationPricelistSchema.safeParse({
      name: "",
      active: true,
    });

    expect(result.success).toBe(false);
  });

  it("maps form values to create payload", () => {
    const payload = toCreateOrganizationPricelistPayload({
      name: "Cash Pricelist",
      active: false,
    });

    expect(payload).toEqual({
      name: "Cash Pricelist",
      active: false,
    });
  });
});
