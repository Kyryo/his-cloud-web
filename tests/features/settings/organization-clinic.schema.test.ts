import { describe, expect, it } from "vitest";

import { createOrganizationClinicSchema } from "@/features/settings/schemas/organization-clinic.schema";

describe("createOrganizationClinicSchema", () => {
  it("requires name and code", () => {
    const result = createOrganizationClinicSchema.safeParse({
      name: "",
      code: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid clinic payload", () => {
    const result = createOrganizationClinicSchema.safeParse({
      name: "Annex Clinic",
      code: "ANNEX-01",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid clinic codes", () => {
    const result = createOrganizationClinicSchema.safeParse({
      name: "Annex Clinic",
      code: "bad code!",
    });

    expect(result.success).toBe(false);
  });
});
