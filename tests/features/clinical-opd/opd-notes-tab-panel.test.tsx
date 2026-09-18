import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OpdNotesTabPanel } from "@/features/clinical-opd/components/tabs/OpdNotesTabPanel";

const workspace = vi.hoisted(() => ({
  isChartLocked: false,
  capabilities: ["record_clinical_note"],
}));

vi.mock(
  "@/features/clinical-opd/components/detail/opd-encounter-workspace-context",
  () => ({
    useOpdEncounterWorkspace: () => workspace,
  }),
);

vi.mock("@/features/clinical-opd/hooks/use-clinical-opd", () => ({
  useEncounterWorkspace: () => ({
    clinicalNotes: {
      isLoading: false,
      data: [
        {
          uuid: "note-1",
          body: "Signed consult note",
          recorded_at: "2026-09-18T10:00:00Z",
          recorded_by_name: "Dr. Banda",
        },
      ],
    },
  }),
  useCreateClinicalNote: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useAmendClinicalNote: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

afterEach(() => {
  cleanup();
  workspace.isChartLocked = false;
});

describe("OpdNotesTabPanel", () => {
  it("lets the clinician create a note while the chart is open", () => {
    render(<OpdNotesTabPanel visitUuid="visit-1" encounterUuid="enc-1" />);
    expect(screen.getByRole("button", { name: /Add note/i })).toBeInTheDocument();
    expect(screen.queryByText("Amend")).not.toBeInTheDocument();
  });

  it("offers amend only after the encounter is completed", () => {
    workspace.isChartLocked = true;
    render(<OpdNotesTabPanel visitUuid="visit-1" encounterUuid="enc-1" />);
    expect(screen.queryByRole("button", { name: /Add note/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Row actions" })).toBeInTheDocument();
  });
});
