import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  dashboardFixture,
  overviewFixture,
  tenantsFixture,
} from "./fixtures/overview.fixture";

vi.mock("@/features/platform-admin/components/overview/OverviewEChart", () => ({
  OverviewEChart: ({ ariaLabel }: { ariaLabel: string }) => (
    <div role="img" aria-label={ariaLabel} />
  ),
  verticalGradient: () => "gradient",
}));

vi.mock(
  "@/features/platform-admin/components/PlatformAdminFinanceEntryPanel",
  () => ({
    PlatformAdminFinanceEntryPanel: () => <div data-testid="finance-panel" />,
  }),
);

const { PlatformAdminOverviewView } =
  await import("@/features/platform-admin/components/overview/PlatformAdminOverviewView");

const emptyOverview = {
  ...overviewFixture,
  summary: {
    active_tenants: 0,
    revenue: {
      amount: "0",
      currency_code: "USD",
      period_label: "October 2026",
    },
    burn_rate: { amount: "0", currency_code: "USD", window_months: 3 },
    runway_months: null,
  },
  cohort_retention: {
    activity_definition: "sales_order_or_invoice",
    cohorts: [],
  },
  net_dollar_retention: { current_month_ndr_percent: null, series: [] },
};

afterEach(cleanup);

describe("PlatformAdminOverviewView", () => {
  it("renders headline stats with deltas and sparklines from real series", () => {
    render(
      <PlatformAdminOverviewView
        overview={overviewFixture}
        tenants={tenantsFixture}
        dashboard={dashboardFixture}
        onFinanceRecorded={() => {}}
      />,
    );
    const stats = screen.getAllByRole("definition").map((el) => el.textContent);
    expect(stats).toContain("42");
    expect(screen.getByText("+1.8 pts")).toBeInTheDocument();
    expect(screen.getAllByTestId("overview-sparkline")).toHaveLength(2);
    expect(screen.getByText("19 mo")).toBeInTheDocument();
  });

  it("renders charts, recent tenants and footprint", () => {
    render(
      <PlatformAdminOverviewView
        overview={overviewFixture}
        tenants={tenantsFixture}
        dashboard={dashboardFixture}
        onFinanceRecorded={() => {}}
      />,
    );
    expect(
      screen.getByRole("img", { name: "Tenant growth over time" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Cohort retention heatmap" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Net dollar retention over time" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(7);
    expect(screen.getByText("Platform footprint")).toBeInTheDocument();
    expect(screen.getByText("73% active")).toBeInTheDocument();
  });

  it("switches cohort view and growth range", () => {
    render(
      <PlatformAdminOverviewView
        overview={overviewFixture}
        tenants={tenantsFixture}
        onFinanceRecorded={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Curves" }));
    expect(
      screen.getByRole("img", { name: "Cohort retention curves" }),
    ).toBeInTheDocument();

    const ranges = screen.getByRole("tablist", { name: "Tenant growth range" });
    fireEvent.click(within(ranges).getByRole("tab", { name: "3M" }));
    expect(within(ranges).getByRole("tab", { name: "3M" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.queryByText("Platform footprint")).not.toBeInTheDocument();
  });

  it("shows empty states and omits deltas without data", () => {
    render(
      <PlatformAdminOverviewView
        overview={emptyOverview}
        tenants={[]}
        onFinanceRecorded={() => {}}
      />,
    );
    expect(
      screen.getByText("No onboarding cohorts with product activity yet."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Net dollar retention needs at least 13 months of tenant payments.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryAllByTestId("overview-sparkline")).toHaveLength(0);
    expect(screen.getByText("Record payments to populate")).toBeInTheDocument();
  });
});
