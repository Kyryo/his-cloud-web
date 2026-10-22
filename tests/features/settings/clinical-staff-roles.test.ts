import { describe, expect, it } from "vitest";

import type { OrganizationUser } from "@/features/settings/types/settings.types";
import {
  filterClinicalStaff,
  groupClinicalStaff,
  groupDentalStaff,
  isDentalStaffUser,
  isEmrStaffUser,
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
  it("scopes EMR and dental staff membership separately", () => {
    expect(isEmrStaffUser(staff({ groups: ["Clinical"], user_role: "" }))).toBe(
      true,
    );
    expect(
      isEmrStaffUser(staff({ groups: ["Billing"], user_role: "nurse" })),
    ).toBe(true);
    expect(
      isEmrStaffUser(staff({ groups: ["Dental"], user_role: "dentist" })),
    ).toBe(false);
    expect(
      isDentalStaffUser(staff({ groups: ["Dental"], user_role: "" })),
    ).toBe(true);
    expect(
      isDentalStaffUser(staff({ groups: ["Billing"], user_role: "dentist" })),
    ).toBe(true);
    expect(
      isDentalStaffUser(staff({ groups: ["Clinical"], user_role: "nurse" })),
    ).toBe(false);
  });

  it("groups EMR staff by physician, nurse, then unassigned", () => {
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

  it("groups dental staff by dentist then unassigned", () => {
    const groups = groupDentalStaff([
      staff({ id: 1, name: "Dee", user_role: "dentist", groups: ["Dental"] }),
      staff({ id: 2, name: "Una", user_role: "", groups: ["Dental"] }),
    ]);

    expect(groups.map((group) => group.id)).toEqual(["dentist", "unassigned"]);
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
