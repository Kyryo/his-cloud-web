import { describe, expect, it } from "vitest";

import {
  toUpdateOrganizationUserPayload,
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

  it("maps general form values including tenant admin flag", () => {
    expect(
      toUpdateOrganizationUserPayload({
        name: "Jane Doe",
        email: "jane@test.com",
        password: "",
        is_admin: true,
      }),
    ).toEqual({
      name: "Jane Doe",
      email: "jane@test.com",
      is_admin: true,
    });
  });
});
