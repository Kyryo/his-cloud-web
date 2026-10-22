import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DENTAL_HISTORY_ALLOWED_SECTIONS,
  DENTAL_HISTORY_SECTION_IDS,
  DENTAL_WORKSPACE_ROUTING,
} from "@/features/clinical-dental/constants/dental-workspace-routing";
import { OpdClinicalHistoryPanel } from "@/features/clinical-opd/components/detail/OpdClinicalHistoryPanel";
import { ClinicalWorkspaceConfigProvider } from "@/features/clinical-workspace/components/clinical-workspace-config-context";
import type {
  ClinicalWorkspaceConfig,
  ClinicalWorkspaceHistorySectionProps,
} from "@/features/clinical-workspace/types/clinical-workspace.types";

vi.mock(
  "@/features/clinical-opd/components/detail/opd-encounter-workspace-context",
  () => ({
    useOpdEncounterWorkspace: () => ({ visitUuid: "visit-1", encounterUuid: "enc-1" }),
  }),
);

vi.mock("@/features/clinical-opd/hooks/use-clinical-opd", () => ({
  useEncounterClinicalHistory: () => ({
    isLoading: false,
    data: {
      visits: [
        {
          visit_uuid: "visit-0",
          encounter_uuid: "enc-0",
          visit_date: "2026-09-01T09:00:00Z",
          department: "Dental",
          status: "completed",
          started_at: null,
          ended_at: null,
        },
      ],
      selected_visit_uuid: "visit-0",
      selected_encounter_uuid: "enc-0",
      notes: [],
      orders: [],
      diagnoses: [],
      medications: [],
      observations: [],
      chief_complaints: [],
      hpis: [],
    },
  }),
}));

function FakeTreatmentSection({
  historyEncounterUuid,
}: ClinicalWorkspaceHistorySectionProps) {
  return (
    <p data-testid="fake-treatment-section">
      Treatment for {historyEncounterUuid}
    </p>
  );
}

const CONFIG: ClinicalWorkspaceConfig = {
  ...DENTAL_WORKSPACE_ROUTING,
  panels: {},
  historyAllowedSections: DENTAL_HISTORY_ALLOWED_SECTIONS,
  historySections: [
    {
      id: DENTAL_HISTORY_SECTION_IDS.procedures,
      label: "Treatment",
      Component: FakeTreatmentSection,
    },
  ],
};

afterEach(() => {
  cleanup();
});

describe("OpdClinicalHistoryPanel specialty sections", () => {
  it("shows dental history chips in consult order", () => {
    render(
      <ClinicalWorkspaceConfigProvider config={CONFIG}>
        <OpdClinicalHistoryPanel />
      </ClinicalWorkspaceConfigProvider>,
    );

    const nav = screen.getByTestId("opd-clinical-history-section-nav");
    expect(nav).toHaveTextContent(
      /Complaints.*Notes.*Orders.*Treatment.*Medications/s,
    );
    expect(
      screen.queryByTestId("opd-history-section-exam"),
    ).not.toBeInTheDocument();
  });

  it("opens the treatment specialty section requested by the tab", () => {
    render(
      <ClinicalWorkspaceConfigProvider config={CONFIG}>
        <OpdClinicalHistoryPanel section={DENTAL_HISTORY_SECTION_IDS.procedures} />
      </ClinicalWorkspaceConfigProvider>,
    );

    expect(screen.getByTestId("fake-treatment-section")).toHaveTextContent(
      "Treatment for enc-0",
    );
  });

  it("shows only the built-in sections outside a specialty workspace", () => {
    render(<OpdClinicalHistoryPanel />);

    expect(
      screen.queryByTestId(`opd-history-section-${DENTAL_HISTORY_SECTION_IDS.procedures}`),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("opd-history-section-complaint")).toBeInTheDocument();
    expect(
      screen.queryByTestId("opd-history-section-notes"),
    ).not.toBeInTheDocument();
  });
});
