import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import {
  buildSettingsNavigation,
  findActiveSettingsNavigationItem,
  isSettingsNavigationItemActive,
} from "@/features/settings/constants/settings-navigation-config";

describe("settings navigation config", () => {
  it("filters admin-only items for non-admins", () => {
    const categories = buildSettingsNavigation(false);
    const labels = categories.flatMap((category) =>
      category.items.map((item) => item.label),
    );

    expect(labels).toEqual(["Account", "Security"]);
  });

  it("includes admin settings for tenant admins", () => {
    const categories = buildSettingsNavigation(true);
    const labels = categories.flatMap((category) =>
      category.items.map((item) => item.label),
    );

    expect(labels).toEqual(
      expect.arrayContaining([
        "Organization",
        "Account",
        "Security",
        "User Management",
        "Visit Management",
        "Finance & Operations",
        "Modules",
        "Integrations",
      ]),
    );
  });

  it("matches integration child routes under Integrations", () => {
    const categories = buildSettingsNavigation(true);
    const integrations = categories
      .flatMap((category) => category.items)
      .find((item) => item.label === "Integrations");

    expect(integrations).toBeDefined();
    expect(
      isSettingsNavigationItemActive(
        ROUTES.settingsIntegrationsEmail,
        integrations!,
      ),
    ).toBe(true);
    expect(
      findActiveSettingsNavigationItem(
        ROUTES.settingsIntegrationsMasemEclaims,
        categories,
      )?.label,
    ).toBe("Integrations");
  });
});
