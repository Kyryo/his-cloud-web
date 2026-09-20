import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OpdEncounterActions } from "@/features/clinical-opd/components/detail/OpdEncounterActions";

const closeVisit = vi.hoisted(() => vi.fn());
const push = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock(
  "@/features/clinical-opd/components/detail/opd-encounter-workspace-context",
  () => ({
    useOpdEncounterWorkspace: () => ({
      visitUuid: "visit-1",
      isChartLocked: false,
      capabilities: ["record_chief_complaint"],
      userRole: "physician",
    }),
  }),
);

vi.mock("@/features/visits/services/visits.service", () => ({
  closeVisit: (...args: unknown[]) => closeVisit(...args),
  fetchVisit: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("OpdEncounterActions", () => {
  it("closes the visit without requiring disposition", async () => {
    closeVisit.mockResolvedValue({ uuid: "visit-1", status: "completed" });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <OpdEncounterActions customer={null} />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByTestId("opd-encounter-close-visit-button"));

    await waitFor(() => {
      expect(closeVisit).toHaveBeenCalledWith("visit-1");
    });
    expect(push).toHaveBeenCalledWith("/clinical/opd");
  });
});
