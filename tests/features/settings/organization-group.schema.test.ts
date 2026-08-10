import { describe, expect, it } from "vitest";

import { PORTAL_GROUP_NAMES } from "@/constants/portal-groups";
import {
  organizationGroupSchema,
  toCreateOrganizationGroupPayload,
} from "@/features/settings/schemas/organization-group.schema";

describe("organization group schema", () => {
  it("accepts portal group names", () => {
    const parsed = organizationGroupSchema.parse({ name: "Billing" });
    expect(parsed.name).toBe("Billing");
    expect(toCreateOrganizationGroupPayload(parsed)).toEqual({ name: "Billing" });
  });

  it("rejects free-text group names", () => {
    const result = organizationGroupSchema.safeParse({ name: "Night Shift" });
    expect(result.success).toBe(false);
  });

  it("covers the portal catalog", () => {
    expect(PORTAL_GROUP_NAMES).toContain("Claims");
    expect(PORTAL_GROUP_NAMES).toContain("Registration");
  });
});
