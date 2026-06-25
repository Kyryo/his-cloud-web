import { describe, expect, it } from "vitest";

import { buildSidebarNavItems } from "@/features/app-shell/utils/build-sidebar-nav";
import { createIdenticonDataUri } from "@/lib/dicebear-identicon";
import { ROUTES } from "@/constants/routes";

describe("createIdenticonDataUri", () => {
  it("returns a deterministic data URI for a seed", () => {
    const first = createIdenticonDataUri("ada@example.com");
    const second = createIdenticonDataUri("ada@example.com");

    expect(first).toMatch(/^data:image\/svg\+xml;utf8,/);
    expect(first).toBe(second);
  });
});

describe("buildSidebarNavItems", () => {
  it("includes enabled clients navigation for registration users", () => {
    const items = buildSidebarNavItems(["Registration"], ROUTES.customers);

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Front Desk",
          url: ROUTES.customers,
          isActive: true,
          items: expect.arrayContaining([
            expect.objectContaining({
              title: "Clients",
              url: ROUTES.customers,
              isActive: true,
            }),
          ]),
        }),
        expect.objectContaining({
          title: "Settings",
          url: ROUTES.settingsAccount,
          isActive: false,
          items: expect.arrayContaining([
            expect.objectContaining({
              title: "Account",
              url: ROUTES.settingsAccount,
            }),
          ]),
        }),
      ]),
    );
  });

  it("includes organization settings for tenant admins", () => {
    const items = buildSidebarNavItems(
      ["Registration"],
      ROUTES.settingsOrganization,
      true,
    );

    const settings = items.find((item) => item.title === "Settings");

    expect(settings?.isActive).toBe(true);
    expect(settings?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Account" }),
        expect.objectContaining({
          title: "Organization",
          url: ROUTES.settingsOrganization,
          isActive: true,
        }),
        expect.objectContaining({
          title: "Visit Management",
          url: ROUTES.settingsVisitManagement,
          isActive: false,
        }),
        expect.objectContaining({
          title: "Finance & Operations",
          url: ROUTES.settingsFinanceOperations,
          isActive: false,
        }),
      ]),
    );
  });

  it("groups only authorized therapy disciplines under Therapy", () => {
    const items = buildSidebarNavItems(
      ["Speech", "Occupational"],
      ROUTES.therapySpeech,
    );
    const therapy = items.find((item) => item.title === "Therapy");

    expect(therapy).toEqual(
      expect.objectContaining({
        url: ROUTES.therapySpeech,
        isActive: true,
        items: [
          expect.objectContaining({
            title: "OT Queue",
            url: ROUTES.therapyOccupational,
            isActive: false,
          }),
          expect.objectContaining({
            title: "Speech Queue",
            url: ROUTES.therapySpeech,
            isActive: true,
          }),
        ],
      }),
    );
  });
});

