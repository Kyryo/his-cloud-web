import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import { buildCommandPaletteItems } from "@/features/app-shell/utils/build-command-palette-items";
import { buildSidebarNavItems } from "@/features/app-shell/utils/build-sidebar-nav";

describe("buildCommandPaletteItems", () => {
  it("flattens sidebar modules and notifications, without settings", () => {
    const items = buildCommandPaletteItems(
      buildSidebarNavItems(["Registration"], ROUTES.overview),
    );

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Overview", href: ROUTES.overview, group: "Pages" }),
        expect.objectContaining({ title: "Clients", href: ROUTES.customers }),
        expect.objectContaining({
          title: "Notifications",
          href: ROUTES.notifications,
          group: "Pages",
        }),
      ]),
    );
    expect(items.some((item) => item.href.startsWith(ROUTES.settings))).toBe(false);
    expect(items.some((item) => item.group === "Settings")).toBe(false);
  });
});
