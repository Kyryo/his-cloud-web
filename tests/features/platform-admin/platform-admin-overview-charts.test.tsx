import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  PlatformAdminCohortRetentionChart,
  PlatformAdminNdrChart,
} from "@/features/platform-admin/components/PlatformAdminOverviewCharts";

describe("PlatformAdminOverviewCharts", () => {
  it("renders cohort retention empty state", () => {
    render(
      <PlatformAdminCohortRetentionChart
        retention={{ activity_definition: "sales_order_or_invoice", cohorts: [] }}
      />,
    );

    expect(
      screen.getByText("No onboarding cohorts with product activity yet."),
    ).toBeInTheDocument();
  });

  it("renders NDR empty state", () => {
    render(
      <PlatformAdminNdrChart
        ndr={{ current_month_ndr_percent: null, series: [] }}
      />,
    );

    expect(
      screen.getByText(
        "Net dollar retention needs at least 13 months of tenant payments.",
      ),
    ).toBeInTheDocument();
  });
});
