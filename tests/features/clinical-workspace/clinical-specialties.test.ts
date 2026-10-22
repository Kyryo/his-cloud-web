import { describe, expect, it } from "vitest";

import { buildSidebarNavItems } from "@/features/app-shell/utils/build-sidebar-nav";
import { resolvePortalModuleForPath } from "@/features/app-shell/utils/module-entitlements";
import {
  clinicalSpecialtyForDepartmentType,
  clinicalSpecialtyForPath,
  getClinicalSpecialty,
  specialtyAllowsOrderItemType,
} from "@/features/clinical-workspace/constants/clinical-specialties";
import { clinicalEncounterLandingHref } from "@/features/visits/utils/clinical-encounter-links";

describe("clinical specialties", () => {
  it("resolves specialties by path and department type", () => {
    expect(clinicalSpecialtyForPath("/clinical/dental/v1/e1")?.code).toBe("dental");
    expect(clinicalSpecialtyForPath("/clinical/opd")?.code).toBe("opd");
    expect(clinicalSpecialtyForPath("/clinical/dentalx")).toBeNull();
    expect(clinicalSpecialtyForDepartmentType("dental")?.code).toBe("dental");
    expect(clinicalSpecialtyForDepartmentType("pharmacy")).toBeNull();
    expect(() => getClinicalSpecialty("dental")).not.toThrow();
  });

  it("maps specialty workspaces to their portal module", () => {
    expect(resolvePortalModuleForPath("/clinical/dental")).toBe("Dental");
    expect(resolvePortalModuleForPath("/clinical/dental/v1/e1/dental-chart")).toBe(
      "Dental",
    );
    expect(resolvePortalModuleForPath("/clinical/opd/v1/e1")).toBe("Clinical");
  });

  it("adds a Dental Queue sidebar item for Dental members", () => {
    const items = buildSidebarNavItems(
      ["Dental"],
      "/clinical/dental",
      false,
      false,
      ["Dental", "Clinical"],
    );
    const dental = items.find((item) => item.items?.some((child) => child.title === "Dental Queue"));

    expect(dental?.isActive).toBe(true);
    expect(dental?.items?.find((child) => child.title === "Dental Queue")?.url).toBe(
      "/clinical/dental",
    );
    expect(
      items.some((item) => item.items?.some((child) => child.title === "OPD Queue")),
    ).toBe(false);
  });

  it("links new encounters to the workspace of their department type", () => {
    expect(
      clinicalEncounterLandingHref(
        "dental",
        "v1",
        "e1",
        ["perform_dental_procedure"],
        "dentist",
      ),
    ).toBe("/clinical/dental/v1/e1/treatment");
    expect(clinicalEncounterLandingHref("pharmacy", "v1", "e1", [], null)).toBeNull();
  });

  it("limits dental orders to radiology and sundries", () => {
    const dental = getClinicalSpecialty("dental");
    const opd = getClinicalSpecialty("opd");

    expect(specialtyAllowsOrderItemType(dental, "RADIOLOGY")).toBe(true);
    expect(specialtyAllowsOrderItemType(dental, "SUNDRY")).toBe(true);
    expect(specialtyAllowsOrderItemType(dental, "LABORATORY")).toBe(false);
    expect(specialtyAllowsOrderItemType(dental, "PROCEDURE")).toBe(false);
    expect(specialtyAllowsOrderItemType(opd, "LABORATORY")).toBe(true);
    expect(specialtyAllowsOrderItemType(opd, "PROCEDURE")).toBe(true);
  });
});
