import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OpdEncounterWorkspaceBody } from "@/features/clinical-opd/components/detail/OpdEncounterWorkspaceBody";

const route = vi.hoisted(() => ({ pathname: "/clinical/opd/visit-1/enc-1" }));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
}));

vi.mock(
  "@/features/clinical-opd/components/detail/opd-encounter-workspace-context",
  () => ({
    useOpdEncounterWorkspace: () => ({
      visitUuid: "visit-1",
      encounterUuid: "enc-1",
      capabilities: [
        "view_activity_tab",
        "view_physical_examination_tab",
        "view_orders_tab",
      ],
      chartSummary: null,
      isChartLocked: false,
    }),
  }),
);

vi.mock("@/features/clinical-opd/hooks/use-clinical-opd", () => ({
  useEncounterWorkspace: () => ({
    observations: {
      data: [
        {
          uuid: "obs-1",
          definition_code: "weight",
          definition_name: "Weight",
          numeric_value: "72.5",
          text_value: "",
          unit: "kg",
          recorded_at: new Date().toISOString(),
          recorded_by_name: "Nurse",
        },
      ],
      isLoading: false,
    },
  }),
  useOpdEncounterTabCounts: () => ({ orders: 2 }),
}));

vi.mock(
  "@/features/clinical-opd/components/detail/OpdClinicalHistoryPanel",
  () => ({
    OpdClinicalHistoryPanel: () => (
      <aside data-testid="opd-clinical-history-panel" />
    ),
  }),
);

vi.mock(
  "@/features/clinical-opd/components/detail/OpdEncounterSummaryPanel",
  () => ({
    OpdEncounterSummaryPanel: () => (
      <aside data-testid="opd-encounter-summary-panel" />
    ),
  }),
);

afterEach(() => {
  cleanup();
  route.pathname = "/clinical/opd/visit-1/enc-1";
});

describe("OpdEncounterWorkspaceBody", () => {
  it("uses the overview layout on the landing tab", () => {
    render(
      <OpdEncounterWorkspaceBody>
        <p>Overview</p>
      </OpdEncounterWorkspaceBody>,
    );

    expect(screen.getByTestId("opd-overview-layout")).toBeInTheDocument();
    expect(screen.getByTestId("opd-encounter-summary-panel")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Chart" })).toHaveAttribute(
      "href",
      "/clinical/opd/visit-1/enc-1",
    );
    expect(screen.getByTestId("opd-encounter-tab-count-orders")).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId("opd-encounter-vitals-stats")).toBeInTheDocument();
    expect(
      screen.queryByTestId("opd-physician-history-layout"),
    ).not.toBeInTheDocument();
  });

  it("keeps vitals and tab counts visible on clinical work tabs", () => {
    route.pathname = "/clinical/opd/visit-1/enc-1/orders";

    render(
      <OpdEncounterWorkspaceBody>
        <p>Orders</p>
      </OpdEncounterWorkspaceBody>,
    );

    expect(screen.getByTestId("opd-encounter-vitals-stats")).toBeInTheDocument();
    expect(screen.getByText("72.5")).toBeInTheDocument();
    expect(screen.getByText("kg")).toBeInTheDocument();
    expect(screen.getByTestId("opd-encounter-tab-count-orders")).toHaveTextContent(
      "2",
    );
  });

  it("adds the previous-visit panel on clinical documentation tabs", () => {
    route.pathname = "/clinical/opd/visit-1/enc-1/physical-examination";

    render(
      <OpdEncounterWorkspaceBody>
        <p>Physical examination</p>
      </OpdEncounterWorkspaceBody>,
    );

    expect(screen.getByTestId("opd-encounter-vitals-stats")).toBeInTheDocument();
    expect(screen.getByTestId("opd-physician-history-layout")).toBeInTheDocument();
    expect(screen.getByTestId("opd-clinical-history-panel")).toBeInTheDocument();
  });
});
