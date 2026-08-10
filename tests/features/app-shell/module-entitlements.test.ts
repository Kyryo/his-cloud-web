import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import {
  isModuleEnabled,
  resolvePortalModuleForPath,
} from "@/features/app-shell/utils/module-entitlements";

describe("module entitlements", () => {
  it("resolves portal modules from pathnames", () => {
    expect(resolvePortalModuleForPath(ROUTES.customers)).toBe("Registration");
    expect(resolvePortalModuleForPath(ROUTES.salesOrders)).toBe("Billing");
    expect(resolvePortalModuleForPath(ROUTES.claims)).toBe("Claims");
    expect(resolvePortalModuleForPath(ROUTES.claimsRemittances)).toBe("Claims");
    expect(resolvePortalModuleForPath(ROUTES.inventoryStock)).toBe("Inventory");
    expect(resolvePortalModuleForPath(ROUTES.pharmacyQueue)).toBe(
      "Dispensation",
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
