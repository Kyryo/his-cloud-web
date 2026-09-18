import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OpdOverviewTabPanel } from "@/features/clinical-opd/components/tabs/OpdOverviewTabPanel";

vi.mock(
  "@/features/clinical-opd/components/detail/opd-encounter-workspace-context",
  () => ({
    useOpdEncounterWorkspace: () => ({
      visitUuid: "visit-1",
      encounterUuid: "enc-1",
      visibleTabIds: [
        "overview",
        "vital-signs",
        "physical-examination",
        "orders",
        "activity",
      ],
      capabilities: ["record_vitals", "record_physical_exam"],
      userRole: "physician",
      chartSummary: {
        allergies: [],
        this_encounter_vitals: [
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
        last_vitals: [],
        last_chief_complaints: [],
        last_hpis: [],
        last_encounter_uuid: null,
        open_orders: [],
        investigation_orders: [],
        problem_list: [],
        current_medications: [],
      },
      isChartLocked: false,
    }),
  }),
);

vi.mock("@/features/clinical-opd/hooks/use-clinical-opd", () => ({
  useEncounterHistorySummary: () => ({
    data: { recent_encounters: [] },
    isLoading: false,
  }),
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
    orders: { data: [], isLoading: false },
    prescriptions: { data: [], isLoading: false },
    nursingNotes: { data: [], isLoading: false },
    clinicalNotes: { data: [], isLoading: false },
    physicalExams: { data: [], isLoading: false },
    timeline: {
      data: [
        {
          type: "observation",
          occurred_at: "2026-09-18T10:00:00Z",
          summary: "Weight recorded",
          actor: "Nurse",
          object_uuid: "obs-1",
        },
      ],
      isLoading: false,
    },
  }),
}));

vi.mock("@/features/clinical/services/clinical-diagnosis.service", () => ({
  fetchEncounterDiagnoses: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

function renderOverview() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <OpdOverviewTabPanel visitUuid="visit-1" encounterUuid="enc-1" />
    </QueryClientProvider>,
  );
}

describe("OpdOverviewTabPanel", () => {
  it("shows vitals, continue actions, and recent activity", () => {
    renderOverview();

    expect(screen.getByTestId("opd-overview-tab-panel")).toBeInTheDocument();
    expect(screen.getByText("Latest vitals")).toBeInTheDocument();
    expect(screen.getByText("72.5")).toBeInTheDocument();
    expect(screen.getByText("kg")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /Record vitals/i })[0],
    ).toHaveAttribute("href", "/clinical/opd/visit-1/enc-1/vital-signs");
    expect(screen.getByText("This visit")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Write examination/i }),
    ).toHaveAttribute(
      "href",
      "/clinical/opd/visit-1/enc-1/physical-examination",
    );
    expect(screen.getByText("Weight recorded")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View all" })).toHaveAttribute(
      "href",
      "/clinical/opd/visit-1/enc-1/activity",
    );
  });
});
