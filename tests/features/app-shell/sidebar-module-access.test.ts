import { describe, expect, it } from "vitest";

import { buildSidebarNavItems } from "@/features/app-shell/utils/build-sidebar-nav";
import { ROUTES } from "@/constants/routes";

describe("sidebar modules follow role and entitlement", () => {
  it("shows Laboratory only when the user has the role and the module is on", () => {
    const missingRole = buildSidebarNavItems(
      ["Billing"],
      ROUTES.overview,
      true,
      false,
      ["Billing", "Lab"],
    );
    const missingEntitlement = buildSidebarNavItems(
      ["Billing", "Lab"],
      ROUTES.overview,
      true,
      false,
      ["Billing"],
    );
    const ready = buildSidebarNavItems(
      ["Billing", "Lab"],
      ROUTES.overview,
      true,
      false,
      ["Billing", "Lab"],
    );

    expect(missingRole.some((item) => item.title === "Laboratory")).toBe(false);
    expect(missingEntitlement.some((item) => item.title === "Laboratory")).toBe(
      false,
    );
    expect(ready.some((item) => item.title === "Laboratory")).toBe(true);
  });
});
