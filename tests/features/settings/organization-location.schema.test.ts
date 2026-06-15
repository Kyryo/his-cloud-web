import { describe, expect, it } from "vitest";

import {
  createOrganizationLocationSchema,
  toCreateOrganizationLocationPayload,
} from "@/features/settings/schemas/organization-location.schema";

describe("organization location schema", () => {
  it("requires department when creating a location", () => {
    const result = createOrganizationLocationSchema.safeParse({
      name: "Pharmacy",
      code: "PH-01",
      clinic: "1",
      department: "",
    });

    expect(result.success).toBe(false);
  });

  it("maps form values to create payload including department", () => {
    expect(
      toCreateOrganizationLocationPayload({
        name: "Pharmacy",
        code: "PH-01",
        clinic: "1",
        department: "3",
        description: " Main store ",
      }),
    ).toEqual({
      name: "Pharmacy",
      code: "PH-01",
      clinic: 1,
      department: 3,
      description: "Main store",
    });
  });
});
