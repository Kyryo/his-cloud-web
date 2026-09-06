import { describe, expect, it } from "vitest";

import type { OrganizationUser } from "@/features/settings/types/settings.types";
import {
  filterClinicalStaff,
  groupClinicalStaff,
  isClinicalStaffUser,
  resolveClinicalStaffGroup,
} from "@/features/settings/utils/clinical-staff-roles";

function staff(overrides: Partial<OrganizationUser>): OrganizationUser {
  return {
    id: 1,
    name: "Ada Lovelace",
    email: "ada@example.com",
    is_admin: false,
    is_active: true,
    user_role: "physician",
    groups: ["Clinical"],
    primary_clinic: { id: 1, name: "Main Clinic", code: "MAIN" },
    ...overrides,
  };
}

describe("clinical staff role helpers", () => {
  it("includes clinical group members and assigned providers", () => {
    expect(isClinicalStaffUser(staff({ groups: ["Clinical"], user_role: "" }))).toBe(
      true,
    );
    expect(
      isClinicalStaffUser(staff({ groups: ["Billing"], user_role: "nurse" })),
    ).toBe(true);
    expect(
      isClinicalStaffUser(staff({ groups: ["Billing"], user_role: "billing" })),
    ).toBe(false);
  });

  it("groups staff by physician, nurse, then unassigned", () => {
    const groups = groupClinicalStaff([
      staff({ id: 1, name: "Nia", user_role: "nurse" }),
      staff({ id: 2, name: "Omar", user_role: "" }),
      staff({ id: 3, name: "Pia", user_role: "physician" }),
    ]);

    expect(groups.map((group) => group.id)).toEqual([
      "physician",
      "nurse",
      "unassigned",
    ]);
    expect(resolveClinicalStaffGroup(staff({ user_role: "billing" }))).toBe(
      "unassigned",
    );
  });

  it("filters by name, email, or clinic", () => {
    const users = [
      staff({ id: 1, name: "Ada Lovelace", email: "ada@example.com" }),
      staff({
        id: 2,
        name: "Grace Hopper",
        email: "grace@example.com",
        primary_clinic: { id: 2, name: "Lakeside", code: "LAKE" },
      }),
    ];

    expect(filterClinicalStaff(users, "grace").map((user) => user.id)).toEqual([2]);
    expect(filterClinicalStaff(users, "lakeside").map((user) => user.id)).toEqual([
      2,
    ]);
    expect(filterClinicalStaff(users, "nomatch")).toEqual([]);
  });
});
