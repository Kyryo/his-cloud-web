import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import {
  filterNavigation,
  hasNavAccess,
  type NavigationItem,
} from "@/features/app-shell/constants/navigation-config";
import {
  isModuleEnabled,
  resolvePortalModuleForPath,
} from "@/features/app-shell/utils/module-entitlements";

describe("module entitlements", () => {
  it("resolves portal modules from pathnames", () => {
    expect(resolvePortalModuleForPath(ROUTES.customers)).toBe("Registration");
    expect(resolvePortalModuleForPath(ROUTES.salesOrders)).toBe("Billing");
    expect(resolvePortalModuleForPath(ROUTES.receivables)).toBe("Billing");
    expect(resolvePortalModuleForPath(ROUTES.claims)).toBe("Claims");
    expect(resolvePortalModuleForPath(ROUTES.claimsRemittances)).toBe("Claims");
    expect(resolvePortalModuleForPath(ROUTES.inventoryStock)).toBe("Inventory");
    expect(resolvePortalModuleForPath(ROUTES.pharmacyQueue)).toBe(
      "Dispensation",
    );
    expect(resolvePortalModuleForPath(ROUTES.clinicalOpd)).toBe("Clinical");
    expect(resolvePortalModuleForPath(ROUTES.occupationalHealth)).toBe(
      "OccupationalHealth",
    );
    expect(resolvePortalModuleForPath(ROUTES.therapyPhysio)).toBe("Therapy");
    expect(resolvePortalModuleForPath(ROUTES.therapySpeech)).toBe("Therapy");
    expect(resolvePortalModuleForPath(ROUTES.therapyOccupational)).toBe(
      "Therapy",
    );
    expect(resolvePortalModuleForPath(ROUTES.settingsModule("therapy"))).toBe(
      "Therapy",
    );
    expect(resolvePortalModuleForPath(ROUTES.settingsModuleLaboratory)).toBe(
      "Lab",
    );
    expect(resolvePortalModuleForPath(ROUTES.settingsModule("radiology"))).toBe(
      "Radiology",
    );
    expect(resolvePortalModuleForPath(ROUTES.settingsModule("dental"))).toBe(
      "Dental",
    );
    expect(resolvePortalModuleForPath(ROUTES.settingsAccount)).toBeNull();
  });

  it("checks enabled_modules on the user", () => {
    expect(
      isModuleEnabled({ enabled_modules: ["Billing", "Claims"] }, "Claims"),
    ).toBe(true);
    expect(isModuleEnabled({ enabled_modules: ["Billing"] }, "Claims")).toBe(
      false,
    );
    expect(isModuleEnabled(null, "Claims")).toBe(false);
  });
});

describe("navigation module entitlements", () => {
  const claimsItem: NavigationItem = {
    name: "Claims",
    href: ROUTES.claims,
    icon: "shield",
    moduleName: "Claims",
    requiredGroup: "Claims",
    enabledInWebNew: true,
  };

  it("hides portal modules that are not entitled", () => {
    expect(
      hasNavAccess(claimsItem, ["Claims"], {
        enabledModules: ["Billing"],
        isTenantAdmin: true,
      }),
    ).toBe(false);
  });

  it("shows entitled modules when the user is in the group", () => {
    expect(
      hasNavAccess(claimsItem, ["Claims"], {
        enabledModules: ["Claims"],
      }),
    ).toBe(true);
  });

  it("hides Therapy nav when the module is not entitled", () => {
    const physioItem: NavigationItem = {
      name: "Physio Queue",
      href: ROUTES.therapyPhysio,
      icon: "dumbbell",
      requiredGroup: "Physio",
      moduleName: "Therapy",
      enabledInWebNew: true,
    };
    expect(
      hasNavAccess(physioItem, ["Physio"], {
        enabledModules: ["Billing"],
      }),
    ).toBe(false);
  });

  it("lets Therapy portal group unlock all discipline queues", () => {
    const physioItem: NavigationItem = {
      name: "Physio Queue",
      href: ROUTES.therapyPhysio,
      icon: "dumbbell",
      requiredGroup: "Physio",
      moduleName: "Therapy",
      enabledInWebNew: true,
    };
    expect(
      hasNavAccess(physioItem, ["Therapy"], {
        enabledModules: ["Therapy"],
      }),
    ).toBe(true);
  });
});
