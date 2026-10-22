import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DentalNotesTabPanel } from "@/features/clinical-dental/components/DentalNotesTabPanel";

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
          body: "Chair-side note",
          recorded_at: "2026-10-18T10:00:00Z",
          recorded_by_name: "Dr. Molar",
        },
      ],
    },
  }),
  useCreateClinicalNote: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useAmendClinicalNote: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateNursingNote: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useAmendNursingNote: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock(
  "@/features/clinical-opd/components/detail/OpdConsultLayout",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@/features/clinical-opd/components/detail/OpdConsultLayout")
      >();
    return {
      ...actual,
      OpdConsultLayout: ({
        form,
        content,
        "data-testid": testId,
      }: {
        form: ReactNode;
        content: ReactNode;
        "data-testid"?: string;
      }) => (
        <div data-testid={testId}>
          <div data-testid="opd-consult-form-column">{form}</div>
          <div data-testid="opd-consult-content-column">{content}</div>
          <div data-testid="opd-clinical-history-panel">History</div>
        </div>
      ),
    };
  },
);

afterEach(() => {
  cleanup();
  workspace.isChartLocked = false;
});

describe("DentalNotesTabPanel", () => {
  it("uses the three-pane consult layout with composer and this-visit notes", () => {
    render(
      <DentalNotesTabPanel
        visitUuid="visit-1"
        encounterUuid="enc-1"
        isActive
      />,
    );

    expect(screen.getByTestId("dental-notes-layout")).toBeInTheDocument();
    expect(screen.getByTestId("opd-consult-form-column")).toBeInTheDocument();
    expect(screen.getByTestId("opd-consult-content-column")).toBeInTheDocument();
    expect(screen.getByTestId("opd-clinical-history-panel")).toBeInTheDocument();
    expect(screen.getByTestId("opd-clinical-note-composer")).toBeInTheDocument();
    expect(screen.getByTestId("dental-notes-list")).toHaveTextContent(
      "Chair-side note",
    );
    expect(screen.getByTestId("dental-notes-header-save")).toBeInTheDocument();
  });

  it("locks the left pane when the encounter is closed", () => {
    workspace.isChartLocked = true;
    render(
      <DentalNotesTabPanel
        visitUuid="visit-1"
        encounterUuid="enc-1"
        isActive
      />,
    );

    expect(screen.getByTestId("opd-consult-form-locked")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Row actions" })).toBeInTheDocument();
  });
});
