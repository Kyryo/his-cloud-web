import { describe, expect, it } from "vitest";

import { pickOrganizationUserPayload } from "@/lib/server/pick-organization-user-payload";

describe("pickOrganizationUserPayload", () => {
  it("includes is_admin when provided as a boolean", () => {
    expect(
      pickOrganizationUserPayload({
        is_admin: true,
      }),
    ).toEqual({ is_admin: true });
  });

  it("trims string fields and omits empty passwords", () => {
    expect(
      pickOrganizationUserPayload({
        name: "  Jane  ",
        email: "jane@test.com",
        password: "   ",
        user_role: "nurse",
      }),
    ).toEqual({
      name: "Jane",
      email: "jane@test.com",
      user_role: "nurse",
    });
  });
});
