import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useOpdQueueBoardMove } from "@/features/clinical-opd/hooks/use-opd-queue-board-move";
import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";

const services = vi.hoisted(() => ({
  createNursingNote: vi.fn(),
  runVisitEncounterAction: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/features/clinical-opd/services/clinical-opd.service", () => ({
  createNursingNote: services.createNursingNote,
}));

vi.mock("@/features/visits/services/visits.service", () => ({
  runVisitEncounterAction: services.runVisitEncounterAction,
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: services.toast }),
}));

const ENCOUNTER: OpdQueueEncounter = {
  encounter_uuid: "enc-1",
  visit_uuid: "visit-1",
  visit_status: "active",
  customer_uuid: "cust-1",
  customer_name: "Jane Doe",
  department_name: "OPD",
  status: "waiting",
  started_at: null,
  mode_of_payment: "cash",
  insurance_scheme_name: null,
  queue_stage: "registered",
};

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useOpdQueueBoardMove", () => {
  beforeEach(() => {
    services.createNursingNote.mockReset();
    services.runVisitEncounterAction.mockReset();
    services.toast.mockReset();
    services.createNursingNote.mockResolvedValue({});
    services.runVisitEncounterAction.mockResolvedValue({});
  });

  it("starts the encounter when it is moved to the doctor", async () => {
    const { result } = renderHook(() => useOpdQueueBoardMove([ENCOUNTER]), {
      wrapper,
    });

    act(() => {
      result.current.requestMove(ENCOUNTER, "with_clinician");
    });

    expect(result.current.rows[0]?.queue_stage).toBe("with_clinician");
    expect(result.current.rows[0]?.status).toBe("in_progress");

    await waitFor(() =>
      expect(services.runVisitEncounterAction).toHaveBeenCalledWith(
        "visit-1",
        "enc-1",
        "start",
      ),
    );
  });

  it("asks for a nursing note before marking an encounter ready", async () => {
    const { result } = renderHook(() => useOpdQueueBoardMove([ENCOUNTER]), {
      wrapper,
    });

    act(() => {
      result.current.requestMove(ENCOUNTER, "triaged");
    });

    expect(services.createNursingNote).not.toHaveBeenCalled();
    expect(result.current.pending?.stage).toBe("triaged");

    await act(async () => {
      await result.current.confirmPending("Alert and waiting.");
    });

    expect(services.createNursingNote).toHaveBeenCalledWith("visit-1", "enc-1", {
      body: "Alert and waiting.",
    });
    expect(result.current.rows[0]?.queue_stage).toBe("triaged");
    expect(result.current.pending).toBeNull();
  });

  it("puts the card back when the update fails", async () => {
    services.runVisitEncounterAction.mockRejectedValue(new Error("Chart is locked"));
    const { result } = renderHook(() => useOpdQueueBoardMove([ENCOUNTER]), {
      wrapper,
    });

    act(() => {
      result.current.requestMove(ENCOUNTER, "completed");
    });

    await waitFor(() => expect(result.current.rows[0]?.queue_stage).toBe("registered"));
    expect(services.toast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "error",
        description: "Chart is locked",
      }),
    );
  });
});
