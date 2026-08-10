import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import { buildSidebarNavItems } from "@/features/app-shell/utils/build-sidebar-nav";

describe("buildSidebarNavItems claims module", () => {
  it("adds Claims as its own menu after Billing with expected children", () => {
    const items = buildSidebarNavItems(["Billing", "Claims"], ROUTES.claims);
    const titles = items.map((item) => item.title);
    const billingIndex = titles.indexOf("Billing");
    const claimsIndex = titles.indexOf("Claims");
    const claimsNav = items.find((item) => item.title === "Claims");
    const billingNav = items.find((item) => item.title === "Billing");

    expect(claimsIndex).toBeGreaterThan(billingIndex);
    expect(billingNav?.items?.map((item) => item.title)).not.toContain("Claims");
    expect(claimsNav?.items?.map((item) => item.title)).toEqual([
      "Submissions",
      "Remittances",
      "Reconciliations",
      "Rejections",
      "Appeals",
    ]);
    expect(claimsNav?.items?.[0]?.url).toBe(ROUTES.claims);
  });

  it("shows locked Claims for tenant admins without the Claims group", () => {
    const items = buildSidebarNavItems([], ROUTES.claims, true);
    const claimsNav = items.find((item) => item.title === "Claims");

    expect(claimsNav).toBeDefined();
    expect(claimsNav?.items?.map((item) => item.title)).toContain("Submissions");
  });

  it("hides Claims for non-admins without the Claims group", () => {
    const items = buildSidebarNavItems(["Billing"], ROUTES.claims, false);
    expect(items.find((item) => item.title === "Claims")).toBeUndefined();
  });

  it("marks only Remittances active on the remittances route", () => {
    const items = buildSidebarNavItems(
      ["Claims"],
      ROUTES.claimsRemittances,
    );
    const claimsNav = items.find((item) => item.title === "Claims");

    expect(claimsNav?.isActive).toBe(true);
    expect(
      claimsNav?.items?.find((item) => item.title === "Submissions")?.isActive,
    ).toBe(false);
    expect(
      claimsNav?.items?.find((item) => item.title === "Remittances")?.isActive,
    ).toBe(true);
  });

  it("marks Submissions active on claim detail routes", () => {
    const items = buildSidebarNavItems(["Claims"], "/claims/42");
    const claimsNav = items.find((item) => item.title === "Claims");

    expect(claimsNav?.isActive).toBe(true);
    expect(
      claimsNav?.items?.find((item) => item.title === "Submissions")?.isActive,
    ).toBe(true);
    expect(
      claimsNav?.items?.find((item) => item.title === "Remittances")?.isActive,
    ).toBe(false);
  });
});
