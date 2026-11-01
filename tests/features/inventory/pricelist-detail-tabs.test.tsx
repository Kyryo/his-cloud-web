import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PricelistDetailTabs } from "@/features/inventory/components/detail/PricelistDetailTabs";

vi.mock("@/features/inventory/components/detail/PricelistDetailProductsTab", () => ({
  PricelistDetailProductsTab: () => null,
}));

vi.mock("@/features/inventory/components/detail/PricelistDetailRulesTab", () => ({
  PricelistDetailRulesTab: () => null,
}));

vi.mock("@/features/inventory/components/detail/PricelistDetailPriceChangesTab", () => ({
  PricelistDetailPriceChangesTab: () => null,
}));

vi.mock("@/features/inventory/components/detail/PricelistDetailAdvisorPackTab", () => ({
  PricelistDetailAdvisorPackTab: ({ isActive }: { isActive: boolean }) =>
    isActive ? <div data-testid="pricelist-advisor-pack-tab">Advisor pack</div> : null,
}));

vi.mock("@/features/inventory/components/detail/PricelistDetailSettingsTab", () => ({
  PricelistDetailSettingsTab: ({ isActive }: { isActive: boolean }) =>
    isActive ? <div data-testid="pricelist-settings-tab">Settings</div> : null,
}));

vi.mock("@/features/inventory/components/detail/PricelistDetailActivityTab", () => ({
  PricelistDetailActivityTab: ({ isActive }: { isActive: boolean }) =>
    isActive ? <div data-testid="pricelist-activity-timeline">Activity</div> : null,
}));

const PRICELIST = {
  uuid: "pl-1",
  name: "MASM VIP",
  is_active: true,
  currency_code: "MWK",
};

afterEach(() => {
  cleanup();
});

describe("PricelistDetailTabs", () => {
  it("places Settings and Activity after Claims advisor pack", () => {
    render(<PricelistDetailTabs pricelist={PRICELIST} />);

    const nav = screen.getByRole("navigation", { name: "Pricelist sections" });
    const labels = within(nav)
      .getAllByRole("button")
      .map((button) => button.textContent);

    expect(labels).toEqual([
      "Products",
      "Rules",
      "Price approvals",
      "Claims advisor pack",
      "Settings",
      "Activity",
    ]);

    fireEvent.click(within(nav).getByRole("button", { name: "Settings" }));
    expect(screen.getByTestId("pricelist-settings-tab")).toBeInTheDocument();

    fireEvent.click(within(nav).getByRole("button", { name: "Activity" }));
    expect(screen.getByTestId("pricelist-activity-timeline")).toBeInTheDocument();
  });
});
