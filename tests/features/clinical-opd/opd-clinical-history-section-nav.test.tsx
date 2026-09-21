import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OpdClinicalHistoryPanel } from "@/features/clinical-opd/components/detail/OpdClinicalHistoryPanel";

vi.mock(
  "@/features/clinical-opd/components/detail/opd-encounter-workspace-context",
  () => ({
    useOpdEncounterWorkspace: () => ({
      visitUuid: "visit-1",
      encounterUuid: "enc-1",
    }),
  }),
);

vi.mock("@/features/clinical-opd/hooks/use-clinical-opd", () => ({
  useEncounterClinicalHistory: () => ({
    data: {
      visits: [],
      selected_encounter_uuid: null,
      notes: [],
      chief_complaints: [],
      hpis: [],
      orders: [],
      diagnoses: [],
      medications: [],
    },
    isLoading: false,
  }),
}));

afterEach(() => {
  cleanup();
});

describe("OpdClinicalHistoryPanel section nav", () => {
  it("lets clinicians switch history sections without leaving the page", () => {
    render(<OpdClinicalHistoryPanel section="complaint" embedded />);

    expect(
      screen.getByTestId("opd-clinical-history-section-nav"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("opd-history-section-complaint")).toHaveAttribute(
      "aria-selected",
      "true",
    );

    fireEvent.click(screen.getByTestId("opd-history-section-orders"));
    expect(screen.getByTestId("opd-history-section-orders")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText(/Previous orders/i)).toBeInTheDocument();
  });
});
