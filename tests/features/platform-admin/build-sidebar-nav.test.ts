import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import { buildSidebarNavItems } from "@/features/app-shell/utils/build-sidebar-nav";

describe("buildSidebarNavItems platform admin", () => {
  it("shows Tenant operations with Overview before Tenants", () => {
    const items = buildSidebarNavItems([], ROUTES.platformAdmin, false, true);
    const tenantOpsNav = items.find((item) => item.title === "Tenant operations");

    expect(tenantOpsNav).toBeDefined();
    expect(tenantOpsNav?.items?.map((item) => item.title)).toEqual([
      "Overview",
      "Tenants",
    ]);
    expect(tenantOpsNav?.items?.[0]?.url).toBe(ROUTES.platformAdmin);
    expect(tenantOpsNav?.items?.[1]?.url).toBe(ROUTES.platformAdminTenants);
  });

  it("adds a Platform menu with Backups above Resources", () => {
    const items = buildSidebarNavItems([], ROUTES.platformAdmin, false, true);
    const titles = items.map((item) => item.title);
    const platformIndex = titles.indexOf("Platform");
    const resourcesIndex = titles.indexOf("Resources");
    const platformNav = items.find((item) => item.title === "Platform");

    expect(platformIndex).toBeGreaterThan(-1);
    expect(resourcesIndex).toBeGreaterThan(platformIndex);
    expect(platformNav?.items?.map((item) => item.title)).toEqual(["Backups"]);
    expect(platformNav?.items?.[0]?.url).toBe(ROUTES.platformAdminBackups);
  });

  it("adds a Resources menu with Sales for platform admins", () => {
    const items = buildSidebarNavItems([], ROUTES.platformAdmin, false, true);
    const resourcesNav = items.find((item) => item.title === "Resources");

    expect(resourcesNav).toBeDefined();
    expect(resourcesNav?.items?.map((item) => item.title)).toEqual(["Sales"]);
    expect(resourcesNav?.items?.[0]?.url).toBe(ROUTES.platformAdminResourcesSales);
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
    const overviewNav = overviewItems.find(
      (item) => item.title === "Tenant operations",
    );
    const tenantsNav = tenantsItems.find(
      (item) => item.title === "Tenant operations",
    );

    expect(overviewNav?.items?.[0]?.isActive).toBe(true);
    expect(overviewNav?.items?.[1]?.isActive).toBe(false);
    expect(tenantsNav?.items?.[0]?.isActive).toBe(false);
    expect(tenantsNav?.items?.[1]?.isActive).toBe(true);
  });

  it("marks Backups active on backup hub and service routes", () => {
    const hubItems = buildSidebarNavItems(
      [],
      ROUTES.platformAdminBackups,
      false,
      true,
    );
    const hmisItems = buildSidebarNavItems(
      [],
      ROUTES.platformAdminBackupsHmis,
      false,
      true,
    );
    const hubNav = hubItems.find((item) => item.title === "Platform");
    const hmisNav = hmisItems.find((item) => item.title === "Platform");
    const tenantOpsOnBackup = hubItems.find(
      (item) => item.title === "Tenant operations",
    );

    expect(hubNav?.isActive).toBe(true);
    expect(hubNav?.items?.[0]?.isActive).toBe(true);
    expect(hmisNav?.isActive).toBe(true);
    expect(hmisNav?.items?.[0]?.isActive).toBe(true);
    expect(tenantOpsOnBackup?.isActive).toBe(false);
  });

  it("marks Sales active on sales resource routes", () => {
    const salesItems = buildSidebarNavItems(
      [],
      ROUTES.platformAdminResourcesSales,
      false,
      true,
    );
    const playbookItems = buildSidebarNavItems(
      [],
      ROUTES.platformAdminSalesPlaybook,
      false,
      true,
    );
    const salesNav = salesItems.find((item) => item.title === "Resources");
    const playbookNav = playbookItems.find((item) => item.title === "Resources");

    expect(salesNav?.isActive).toBe(true);
    expect(salesNav?.items?.[0]?.isActive).toBe(true);
    expect(playbookNav?.isActive).toBe(true);
    expect(playbookNav?.items?.[0]?.isActive).toBe(true);
  });
});
