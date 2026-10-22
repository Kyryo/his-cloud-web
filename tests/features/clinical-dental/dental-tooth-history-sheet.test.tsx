import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DentalToothHistorySheet } from "@/features/clinical-dental/components/DentalToothHistorySheet";

const hooks = vi.hoisted(() => ({
  updateMutateAsync: vi.fn(),
  deleteMutateAsync: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("@/features/clinical-dental/hooks/use-clinical-dental", () => ({
  useDentalToothHistory: () => ({
    isLoading: false,
    isError: false,
    refetch: hooks.refetch,
    data: {
      tooth_number: 36,
      findings: [
        {
          uuid: "f-active",
          tooth_number: 36,
          surfaces: ["O"],
          condition: "caries",
          condition_display: "Caries",
          status: "active",
          notes: "Deep lesion",
          recorded_at: "2026-10-01T09:00:00Z",
          recorded_by_name: "Dr Molar",
          encounter_uuid: "enc-previous",
          visit_uuid: "visit-0",
          visit_date: null,
          resolved_at: null,
          resolved_in_encounter_uuid: null,
        },
        {
          uuid: "f-today",
          tooth_number: 36,
          surfaces: [],
          condition: "watch",
          condition_display: "Watch",
          status: "active",
          notes: "",
          recorded_at: "2026-10-17T09:00:00Z",
          recorded_by_name: "Dr Molar",
          encounter_uuid: "enc-1",
          visit_uuid: "visit-1",
          visit_date: null,
          resolved_at: null,
          resolved_in_encounter_uuid: null,
        },
      ],
      treatments: [
        {
          uuid: "t-1",
          product_uuid: "p-1",
          procedure_name: "Composite filling",
          procedure_code: "DEN-FILL",
          tooth_numbers: [36],
          surfaces: ["O"],
          treatment_status: "completed",
          treatment_date: "2026-09-01",
          notes: "",
          materials_used: "",
          diagnosis: "",
          performed_by_name: "Dr Molar",
          provider_name: "Dr Molar",
          actual_cost: "15000.00",
          visit_order_uuid: null,
          plan_item_uuid: null,
          encounter_uuid: "enc-previous",
          created_at: "2026-09-01T10:00:00Z",
        },
      ],
    },
  }),
  useUpdateDentalFinding: () => ({
    mutateAsync: hooks.updateMutateAsync,
    isPending: false,
  }),
  useDeleteDentalFinding: () => ({
    mutateAsync: hooks.deleteMutateAsync,
    isPending: false,
  }),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderSheet(canRecord: boolean, onRecordFinding = vi.fn()) {
  render(
    <DentalToothHistorySheet
      visitUuid="visit-1"
      encounterUuid="enc-1"
      toothNumber={36}
      canRecord={canRecord}
      onOpenChange={vi.fn()}
      onRecordFinding={onRecordFinding}
    />,
  );
  return onRecordFinding;
}

describe("DentalToothHistorySheet", () => {
  it("lists the tooth's findings and procedures", () => {
    renderSheet(false);

    expect(screen.getByText("Tooth 36")).toBeInTheDocument();
    expect(screen.getAllByTestId("dental-tooth-history-finding")).toHaveLength(2);
    expect(screen.getByTestId("dental-tooth-history-procedure")).toHaveTextContent(
      "Composite filling · O",
    );
    expect(screen.queryByRole("button", { name: "Resolve" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("dental-tooth-record-finding")).not.toBeInTheDocument();
  });

  it("resolves findings and only removes ones from this encounter", async () => {
    hooks.updateMutateAsync.mockResolvedValue({});
    const onRecordFinding = renderSheet(true);

    expect(screen.getAllByRole("button", { name: "Remove" })).toHaveLength(1);
    fireEvent.click(screen.getAllByRole("button", { name: "Resolve" })[0]);
    await waitFor(() =>
      expect(hooks.updateMutateAsync).toHaveBeenCalledWith({
        findingUuid: "f-active",
        payload: { status: "resolved" },
      }),
    );

    fireEvent.click(screen.getByTestId("dental-tooth-record-finding"));
    expect(onRecordFinding).toHaveBeenCalledWith(36);
  });
});
