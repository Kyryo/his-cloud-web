import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { OverviewQuickLinks } from "@/features/overview/components/OverviewQuickLinks";
import { OverviewUsageRow } from "@/features/overview/components/OverviewUsageRow";
import { filterNavigation } from "@/features/app-shell/constants/navigation-config";
import { overviewGreeting } from "@/features/overview/utils/overview-greeting";
import {
  buildOverviewQuickLinks,
  visibleWorkspaceHrefs,
} from "@/features/overview/utils/overview-quick-links";
import { shouldShowOverviewUsage } from "@/features/overview/utils/overview-usage";

describe("overview greeting", () => {
  it("changes with the local hour and omits a missing name", () => {
    const morning = new Date(2026, 9, 5, 9, 0, 0);
    const afternoon = new Date(2026, 9, 5, 14, 0, 0);
    const evening = new Date(2026, 9, 5, 19, 0, 0);

    expect(overviewGreeting("Amina Banda", morning)).toBe(
      "Good morning, Amina Banda",
    );
    expect(overviewGreeting("Amina Banda", afternoon)).toBe(
      "Good afternoon, Amina Banda",
    );
    expect(overviewGreeting("Amina Banda", evening)).toBe(
      "Good evening, Amina Banda",
    );
    expect(overviewGreeting("  ", morning)).toBe("Good morning");
    expect(overviewGreeting(undefined, evening)).toBe("Good evening");
  });
});

describe("overview quick links", () => {
  afterEach(() => {
    cleanup();
  });

  it("only includes hrefs filterNavigation would show", () => {
    const groups = ["Billing"];
    const enabledModules = ["Billing"];
    const allowed = new Set(
      filterNavigation(groups, { enabledModules }).map((item) => item.href),
    );
    allowed.add("/reports");
    allowed.add("/reports/appointments/today");
    allowed.add("/reports/history");

    const links = buildOverviewQuickLinks(groups, enabledModules);

    expect(links.length).toBeGreaterThan(0);
    expect(links.length).toBeLessThanOrEqual(8);
    expect(links.every((link) => allowed.has(link.href))).toBe(true);
    expect(links.some((link) => link.href === "/customers")).toBe(false);
    expect(
      links.filter(
        (link) => link.href === "/sales-orders" || link.href === "/invoices",
      ).length,
    ).toBeLessThanOrEqual(2);

    render(
      <OverviewQuickLinks
        userGroups={groups}
        enabledModules={enabledModules}
      />,
    );
    expect(screen.queryByRole("link", { name: /clients/i })).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /create or view sales orders/i }),
    ).toBeInTheDocument();
  });

  it("shows four action cards and reveals the rest", () => {
    const groups = ["Registration", "Billing", "Lab", "Clinical"];
    render(
      <OverviewQuickLinks userGroups={groups} enabledModules={groups} />,
    );

    expect(screen.getAllByRole("link")).toHaveLength(4);
    expect(
      screen.getByRole("link", { name: "Register or view clients" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /open lab orders/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "See more" }));

    expect(screen.getAllByRole("link").length).toBeGreaterThan(4);
    expect(
      screen.getByRole("link", { name: /open lab orders/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show less" })).toBeInTheDocument();
  });

  it("keeps at most two pages from each module", () => {
    const links = buildOverviewQuickLinks(
      ["Registration"],
      ["Registration"],
    );

    expect(links.map((link) => link.href)).toEqual([
      "/customers",
      "/appointments",
    ]);
    expect(visibleWorkspaceHrefs(["Registration"], ["Registration"]).has("/reports")).toBe(
      false,
    );
  });
});

describe("overview usage", () => {
  afterEach(() => {
    cleanup();
  });

  it("stays hidden until at least two areas remain", () => {
    const allowed = visibleWorkspaceHrefs(["Registration", "Billing"], [
      "Registration",
      "Billing",
    ]);
    const rows = [
      {
        area_key: "/customers",
        use_count: 3,
        last_used_at: "2026-10-05T10:00:00Z",
      },
    ];

    expect(shouldShowOverviewUsage(1)).toBe(false);
    render(
      <OverviewUsageRow
        rows={rows}
        userGroups={["Registration", "Billing"]}
        enabledModules={["Registration", "Billing"]}
        allowedHrefs={allowed}
      />,
    );
    expect(
      screen.queryByRole("region", { name: /based on your previous usage/i }),
    ).not.toBeInTheDocument();

    cleanup();
    render(
      <OverviewUsageRow
        rows={[
          ...rows,
          {
            area_key: "/invoices",
            use_count: 1,
            last_used_at: "2026-10-05T11:00:00Z",
          },
          {
            area_key: "/clinical/opd",
            use_count: 9,
            last_used_at: "2026-10-05T12:00:00Z",
          },
        ]}
        userGroups={["Registration", "Billing"]}
        enabledModules={["Registration", "Billing"]}
        allowedHrefs={allowed}
      />,
    );

    expect(
      screen.getByRole("region", { name: /based on your previous usage/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /clients/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /invoices/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "OPD Queue" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "See more" })).not.toBeInTheDocument();
  });

  it("shows four usage cards and reveals the rest", () => {
    const groups = ["Registration", "Billing"];
    const allowed = visibleWorkspaceHrefs(groups, groups);
    const areas = [
      "/customers",
      "/appointments",
      "/sales-orders",
      "/invoices",
      "/payments",
    ];

    render(
      <OverviewUsageRow
        rows={areas.map((area_key, index) => ({
          area_key,
          use_count: areas.length - index,
          last_used_at: "2026-10-05T10:00:00Z",
        }))}
        userGroups={groups}
        enabledModules={groups}
        allowedHrefs={allowed}
      />,
    );

    expect(screen.getAllByRole("link")).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", { name: "See more" }));
    expect(screen.getAllByRole("link").length).toBeGreaterThan(4);
    expect(screen.getByRole("button", { name: "Show less" })).toBeInTheDocument();
  });
});
