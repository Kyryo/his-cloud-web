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
  it("shows chief complaint and nested HPI", () => {
    render(<OpdComplaintTabPanel visitUuid="visit-1" encounterUuid="enc-1" />);
    expect(screen.getByTestId("opd-complaint-composer")).toBeInTheDocument();
    expect(screen.getByLabelText(/Chief complaint/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Cough for 3 days")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Dry cough, no fever.")).toBeInTheDocument();
  });
});
