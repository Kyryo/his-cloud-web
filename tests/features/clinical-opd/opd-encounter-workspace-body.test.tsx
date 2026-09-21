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
        "record_chief_complaint",
        "view_diagnoses_tab",
        "view_medications_tab",
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

afterEach(() => {
  cleanup();
  route.pathname = "/clinical/opd/visit-1/enc-1";
});

describe("OpdEncounterWorkspaceBody", () => {
  it("shows vitals and the five consult tabs after the header strip", () => {
    render(
      <OpdEncounterWorkspaceBody>
        <p>Overview</p>
      </OpdEncounterWorkspaceBody>,
    );

    expect(screen.getByTestId("opd-encounter-vitals-stats")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Complaint & HPI/ })).toHaveAttribute(
      "href",
      "/clinical/opd/visit-1/enc-1/complaint",
    );
    expect(screen.getByRole("link", { name: /Exam/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Orders/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Diagnosis/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Medication/ })).toBeInTheDocument();
    expect(screen.getByTestId("opd-encounter-tab-count-orders")).toHaveTextContent(
      "2",
    );
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

  it("lets consult tabs own the three-column layout", () => {
    route.pathname = "/clinical/opd/visit-1/enc-1/physical-examination";

    render(
      <OpdEncounterWorkspaceBody>
        <p>Physical examination</p>
      </OpdEncounterWorkspaceBody>,
    );

    expect(screen.getByTestId("opd-encounter-vitals-stats")).toBeInTheDocument();
    expect(screen.getByText("Physical examination")).toBeInTheDocument();
    expect(
      screen.queryByTestId("opd-physician-history-layout"),
    ).not.toBeInTheDocument();
  });
});
