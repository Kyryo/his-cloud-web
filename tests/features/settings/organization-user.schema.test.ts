import { describe, expect, it } from "vitest";

import {
  toUpdateOrganizationUserRolePayload,
  updateOrganizationUserRoleSchema,
} from "@/features/settings/schemas/organization-user.schema";

describe("organization-user.schema", () => {
  it("accepts valid user roles", () => {
    const result = updateOrganizationUserRoleSchema.safeParse({
      user_role: "physician",
    });

    expect(result.success).toBe(true);
  });

  it("maps role form values to update payload", () => {
    expect(
      toUpdateOrganizationUserRolePayload({
        user_role: "",
      }),
    ).toEqual({ user_role: "" });

    expect(
      toUpdateOrganizationUserRolePayload({
        user_role: "nurse",
      }),
    ).toEqual({ user_role: "nurse" });
  });
});
