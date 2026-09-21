import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OpdComplaintTabPanel } from "@/features/clinical-opd/components/tabs/OpdComplaintTabPanel";

vi.mock(
  "@/features/clinical-opd/components/detail/opd-encounter-workspace-context",
  () => ({
    useOpdEncounterWorkspace: () => ({
      isChartLocked: false,
      capabilities: ["record_chief_complaint", "record_hpi"],
    }),
  }),
);

vi.mock(
  "@/features/clinical-opd/components/detail/OpdClinicalHistoryPanel",
  () => ({
    OpdClinicalHistoryPanel: () => (
      <aside data-testid="opd-clinical-history-panel">
        <div data-testid="opd-clinical-history-section-nav" />
      </aside>
    ),
  }),
);

vi.mock("@/features/clinical-opd/hooks/use-clinical-opd", () => ({
  useChiefComplaints: () => ({
    data: [
      {
        uuid: "cc-1",
        text: "Cough for 3 days",
        recorded_at: "2026-09-18T10:00:00Z",
        recorded_by_name: "Dr. Banda",
        has_hpi: true,
        hpi: {
          uuid: "hpi-1",
          chief_complaint_uuid: "cc-1",
          body: "Dry cough, no fever.",
          recorded_at: "2026-09-18T10:05:00Z",
          recorded_by_name: "Dr. Banda",
        },
      },
    ],
    isLoading: false,
  }),
  useCreateChiefComplaint: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateChiefComplaint: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSaveChiefComplaintHpi: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteChiefComplaint: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useChiefComplaintSuggestions: () => ({ data: [], isLoading: false }),
}));

afterEach(() => {
  cleanup();
});

describe("OpdComplaintTabPanel", () => {
  it("shows the form, this-encounter content, and history columns", () => {
    render(<OpdComplaintTabPanel visitUuid="visit-1" encounterUuid="enc-1" />);
    expect(screen.getByTestId("opd-consult-layout")).toBeInTheDocument();
    expect(screen.getByTestId("opd-complaint-composer")).toBeInTheDocument();
    expect(screen.getByLabelText(/Chief complaint/i)).toBeInTheDocument();
    expect(screen.getByTestId("opd-hpi-duration-value")).toBeInTheDocument();
    expect(screen.getByTestId("opd-hpi-duration-unit")).toBeInTheDocument();
    expect(screen.getByText("Cough for 3 days")).toBeInTheDocument();
    expect(screen.getByText("Dry cough, no fever.")).toBeInTheDocument();
    expect(screen.getByTestId("opd-clinical-history-panel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(
      screen.getByTestId("opd-clinical-history-section-nav"),
    ).toBeInTheDocument();
  });

  it("labels each column so the three zones stay identifiable while scrolling", () => {
    render(<OpdComplaintTabPanel visitUuid="visit-1" encounterUuid="enc-1" />);

    expect(screen.getByText("Record")).toBeInTheDocument();
    expect(screen.getByText("This visit")).toBeInTheDocument();
  });
});
