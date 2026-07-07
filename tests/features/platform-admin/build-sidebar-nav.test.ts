import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import { buildSidebarNavItems } from "@/features/app-shell/utils/build-sidebar-nav";

describe("buildSidebarNavItems platform admin", () => {
  it("shows Overview before Tenants for platform admins", () => {
    const items = buildSidebarNavItems([], ROUTES.platformAdmin, false, true);
    const platformNav = items.find((item) => item.title === "Platform");

    expect(platformNav).toBeDefined();
    expect(platformNav?.items?.map((item) => item.title)).toEqual([
      "Overview",
      "Tenants",
    ]);
    expect(platformNav?.items?.[0]?.url).toBe(ROUTES.platformAdmin);
    expect(platformNav?.items?.[1]?.url).toBe(ROUTES.platformAdminTenants);
  });

  it("marks Overview active only on the overview route", () => {
    const overviewItems = buildSidebarNavItems(
      [],
      ROUTES.platformAdmin,
      false,
      true,
    );
    const tenantsItems = buildSidebarNavItems(
      [],
      ROUTES.platformAdminTenants,
      false,
      true,
    );
    const platformOverview = overviewItems.find((item) => item.title === "Platform");
    const platformTenants = tenantsItems.find((item) => item.title === "Platform");

    expect(platformOverview?.items?.[0]?.isActive).toBe(true);
    expect(platformOverview?.items?.[1]?.isActive).toBe(false);
    expect(platformTenants?.items?.[0]?.isActive).toBe(false);
    expect(platformTenants?.items?.[1]?.isActive).toBe(true);
  });
});
