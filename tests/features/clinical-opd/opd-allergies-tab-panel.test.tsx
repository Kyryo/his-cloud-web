import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OpdAllergiesTabPanel } from "@/features/clinical-opd/components/tabs/OpdAllergiesTabPanel";

vi.mock(
  "@/features/clinical-opd/components/detail/opd-encounter-workspace-context",
  () => ({
    useOpdEncounterWorkspace: () => ({
      isChartLocked: false,
      capabilities: ["record_allergy"],
    }),
  }),
);

vi.mock("@/features/clinical-opd/hooks/use-clinical-opd", () => ({
  useEncounterAllergies: () => ({
    data: [
      {
        uuid: "alg-1",
        allergy_name: "Penicillin",
        allergy_type: "medication",
        severity: "severe",
        reaction: "Rash",
        is_active: true,
      },
    ],
    isLoading: false,
  }),
  useCreateEncounterAllergy: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateEncounterAllergy: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

afterEach(() => {
  cleanup();
});

describe("OpdAllergiesTabPanel", () => {
  it("lists active allergies for write and banner support", () => {
    render(<OpdAllergiesTabPanel visitUuid="visit-1" encounterUuid="enc-1" />);
    expect(screen.getByText("Penicillin")).toBeInTheDocument();
    expect(screen.getByText(/medication · severe · Rash/)).toBeInTheDocument();
  });
});
