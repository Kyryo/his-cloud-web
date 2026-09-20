import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OpdDispositionTabPanel } from "@/features/clinical-opd/components/tabs/OpdDispositionTabPanel";

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock(
  "@/features/clinical-opd/components/detail/opd-encounter-workspace-context",
  () => ({
    useOpdEncounterWorkspace: () => ({
      isChartLocked: false,
      capabilities: ["record_disposition"],
    }),
  }),
);

vi.mock("@/features/clinical-opd/hooks/use-clinical-opd", () => ({
  useEncounterDisposition: () => ({
    data: null,
    isLoading: false,
  }),
  useUpsertEncounterDisposition: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

afterEach(() => {
  cleanup();
});

describe("OpdDispositionTabPanel", () => {
  it("treats a missing disposition as an empty optional form", () => {
    render(
      <OpdDispositionTabPanel visitUuid="visit-1" encounterUuid="enc-1" />,
    );

    expect(screen.getByTestId("opd-disposition-tab-panel")).toBeInTheDocument();
    expect(
      screen.getByText(/Closing the visit does not require a disposition/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save disposition" })).toBeInTheDocument();
  });
});
