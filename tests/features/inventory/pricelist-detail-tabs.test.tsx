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
  it("places Claims advisor pack between Price approvals and Summary", () => {
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
      "Summary",
    ]);

    fireEvent.click(within(nav).getByRole("button", { name: "Claims advisor pack" }));
    expect(screen.getByTestId("pricelist-advisor-pack-tab")).toBeInTheDocument();
  });
});
