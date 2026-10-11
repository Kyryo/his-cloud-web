import { describe, expect, it } from "vitest";

import {
  moreSignupDepartments,
  primarySignupDepartments,
  SIGNUP_DEPARTMENTS,
  signupDepartmentModuleNames,
  toggleSignupDepartment,
} from "@/features/auth/constants/signup-departments";

describe("signup departments", () => {
  it("uses the department types the clinic app can run", () => {
    expect(SIGNUP_DEPARTMENTS.map((department) => department.id)).toEqual([
      "opd",
      "dental",
      "occupational_health",
      "physio",
      "occupational",
      "speech",
      "lab",
      "radiology",
      "pharmacy",
    ]);
  });

  it("keeps specialty departments behind see more", () => {
    expect(primarySignupDepartments().map((department) => department.id)).toEqual([
      "opd",
      "dental",
      "radiology",
    ]);
    expect(moreSignupDepartments().map((department) => department.id)).toEqual([
      "occupational_health",
      "physio",
      "occupational",
      "speech",
      "lab",
      "pharmacy",
    ]);
  });

  it("selects laboratory and pharmacy when OPD is chosen", () => {
    expect(toggleSignupDepartment([], "opd")).toEqual([
      "opd",
      "lab",
      "pharmacy",
    ]);
    expect(toggleSignupDepartment(["opd", "lab", "pharmacy"], "opd")).toEqual([]);
  });

  it("turns on registration, billing, and the modules each department needs", () => {
    expect(signupDepartmentModuleNames(["opd"])).toEqual([
      "Registration",
      "Billing",
      "Clinical",
      "Lab",
      "Dispensation",
      "Inventory",
    ]);
    expect(signupDepartmentModuleNames(["physio", "speech"])).toEqual([
      "Registration",
      "Billing",
      "Therapy",
    ]);
  });
});