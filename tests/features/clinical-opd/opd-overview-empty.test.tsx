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
      visibleTabIds: ["overview", "vital-signs"],
      capabilities: ["record_vitals"],
      userRole: "nurse",
      chartSummary: {
        allergies: [],
        this_encounter_vitals: [],
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
    observations: { data: [], isLoading: false },
    orders: { data: [], isLoading: false },
    prescriptions: { data: [], isLoading: false },
    nursingNotes: { data: [], isLoading: false },
    clinicalNotes: { data: [], isLoading: false },
    physicalExams: { data: [], isLoading: false },
    timeline: { data: [], isLoading: false },
  }),
}));

vi.mock("@/features/clinical/services/clinical-diagnosis.service", () => ({
  fetchEncounterDiagnoses: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

describe("OpdOverviewTabPanel empty chart", () => {
  it("shows a first-visit empty summary", () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={client}>
        <OpdOverviewTabPanel visitUuid="visit-1" encounterUuid="enc-1" />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("opd-overview-empty")).toHaveTextContent(
      "First visit",
    );
  });
});
