import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import { buildSidebarNavItems } from "@/features/app-shell/utils/build-sidebar-nav";

describe("buildSidebarNavItems overview", () => {
  it("puts Overview first for clinic users", () => {
    const items = buildSidebarNavItems(["Registration"], ROUTES.overview);

    expect(items[0]).toEqual(
      expect.objectContaining({
        title: "Overview",
        url: ROUTES.overview,
        isActive: true,
        section: "workspace",
      }),
    );
    expect(items[0]?.items).toBeUndefined();
  });

  it("does not nest Overview under Reports", () => {
    const items = buildSidebarNavItems(["Billing"], ROUTES.reportsExports);
    const reports = items.find((item) => item.title === "Reports & Insights");

    expect(reports?.url).toBe(ROUTES.reportsExports);
    expect(reports?.items?.map((item) => item.title)).toEqual([
      "Today's appointments",
      "Reports",
      "Export history",
    ]);
  });

  it("omits Overview for platform admins", () => {
    const items = buildSidebarNavItems([], ROUTES.platformAdmin, false, true);

    expect(items.some((item) => item.title === "Overview")).toBe(false);
  });
});
