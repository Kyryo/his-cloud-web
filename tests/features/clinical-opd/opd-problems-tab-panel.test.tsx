import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OpdProblemsTabPanel } from "@/features/clinical-opd/components/tabs/OpdProblemsTabPanel";

vi.mock(
  "@/features/clinical-opd/components/detail/opd-encounter-workspace-context",
  () => ({
    useOpdEncounterWorkspace: () => ({
      isChartLocked: false,
      capabilities: ["manage_problem_list"],
    }),
  }),
);

vi.mock("@/features/clinical-opd/hooks/use-clinical-opd", () => ({
  useProblemList: () => ({
    data: [
      {
        uuid: "prob-1",
        code: "J06.9",
        standard: "ICD10",
        description: "Upper respiratory infection",
        status: "active",
        notes: "",
        recorded_at: "2026-09-18T10:00:00Z",
        resolved_at: null,
        recorded_by_name: "Dr. Banda",
        source_diagnosis_uuid: null,
      },
    ],
    isLoading: false,
  }),
  useCreateProblemListItem: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateProblemListItem: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

afterEach(() => {
  cleanup();
});

describe("OpdProblemsTabPanel", () => {
  it("renders client-scoped problem list items", () => {
    render(<OpdProblemsTabPanel visitUuid="visit-1" encounterUuid="enc-1" />);
    expect(screen.getByText("Upper respiratory infection")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add problem/i })).toBeInTheDocument();
  });
});
