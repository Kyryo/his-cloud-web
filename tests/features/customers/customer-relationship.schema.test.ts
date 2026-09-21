import { describe, expect, it } from "vitest";

import {
  createCustomerRelationshipDefaultValues,
  createCustomerRelationshipSchema,
  toCustomerRelationshipPayload,
} from "@/features/customers/schemas/customer-relationship.schema";

describe("customer-relationship.schema", () => {
  it("requires a related client uuid", () => {
    const result = createCustomerRelationshipSchema.safeParse(
      createCustomerRelationshipDefaultValues,
    );

    expect(result.success).toBe(false);
  });

  it("maps form values to API payload", () => {
    const values = {
      related_uuid: "57136727-9e05-4ae3-9146-149106022595",
      relationship: "CHILD" as const,
      notes: "  twin  ",
    };

    expect(toCustomerRelationshipPayload(values)).toEqual({
      related: "57136727-9e05-4ae3-9146-149106022595",
      relationship: "CHILD",
      notes: "twin",
    });
  });
});
