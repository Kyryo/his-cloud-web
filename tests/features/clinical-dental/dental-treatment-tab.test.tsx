import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DentalTreatmentTabPanel } from "@/features/clinical-dental/components/DentalTreatmentTabPanel";
import type { DentalProcedure } from "@/features/clinical-dental/types/clinical-dental.types";
import { todayDateInputValue } from "@/features/inventory/schemas/purchase-order.schema";

const state = vi.hoisted(() => ({
  procedures: [] as DentalProcedure[],
  capabilities: [] as string[],
  isChartLocked: false,
  performMutateAsync: vi.fn(),
  updateMutateAsync: vi.fn(),
  deleteMutateAsync: vi.fn(),
}));

vi.mock("@/features/clinical-dental/hooks/use-clinical-dental", () => ({
  useDentalProcedures: () => ({
    data: state.procedures,
    isLoading: false,
    isError: false,
  }),
  usePerformDentalProcedure: () => ({
    mutateAsync: state.performMutateAsync,
    isPending: false,
  }),
  useUpdateDentalProcedure: () => ({
    mutateAsync: state.updateMutateAsync,
    isPending: false,
  }),
  useDeleteDentalProcedure: () => ({
    mutateAsync: state.deleteMutateAsync,
    isPending: false,
  }),
}));

vi.mock(
  "@/features/clinical-opd/components/detail/opd-encounter-workspace-context",
  () => ({
    useOpdEncounterWorkspace: () => ({
      capabilities: state.capabilities,
      isChartLocked: state.isChartLocked,
    }),
  }),
);

vi.mock(
  "@/features/clinical-opd/components/detail/OpdConsultLayout",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@/features/clinical-opd/components/detail/OpdConsultLayout")
      >();
    return {
      ...actual,
      OpdConsultLayout: ({ form, content }: { form: ReactNode; content: ReactNode }) => (
        <div>
          {form}
          {content}
        </div>
      ),
    };
  },
);

vi.mock("@/features/clinical-dental/components/DentalProcedurePicker", () => ({
  DentalProcedurePicker: ({
    onChange,
  }: {
    onChange: (product: { uuid: string; name: string; display_name: string }) => void;
  }) => (
    <button
      type="button"
      data-testid="pick-procedure"
      onClick={() =>
        onChange({ uuid: "prod-1", name: "Extraction", display_name: "Extraction" })
      }
    >
      Pick
    </button>
  ),
}));

vi.mock("@/features/inventory/utils/format-inventory", () => ({
  formatProductLabel: (product: { display_name: string }) => product.display_name,
}));

vi.mock("@/features/dental/components/ClaimLineOdontogramPicker", () => ({
  ClaimLineOdontogramPicker: ({
    value,
    onRequestAssign,
    instruction,
  }: {
    value: number[];
    onRequestAssign: (teeth: number[]) => void;
    instruction?: string;
  }) => (
    <div data-testid="odontogram">
      <span>{instruction}</span>
      <span data-testid="odontogram-value">{value.join(",")}</span>
      <button type="button" data-testid="pick-tooth-36" onClick={() => onRequestAssign([36])}>
        36
      </button>
    </div>
  ),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

function renderPanel() {
  render(<DentalTreatmentTabPanel visitUuid="visit-1" encounterUuid="enc-1" isActive />);
}

beforeEach(() => {
  state.procedures = [];
  state.capabilities = ["perform_dental_procedure"];
  state.isChartLocked = false;
  state.performMutateAsync.mockResolvedValue({ uuid: "treatment-1" });
  state.updateMutateAsync.mockResolvedValue({ uuid: "treatment-1" });
  state.deleteMutateAsync.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("DentalTreatmentTabPanel", () => {
  it("renders the date, procedure and odontogram fields with today's date", () => {
    renderPanel();

    expect(screen.getByTestId("dental-treatment-date")).toHaveValue(todayDateInputValue());
    expect(screen.getByText("Treatment / procedure")).toBeInTheDocument();
    expect(screen.getByTestId("odontogram")).toHaveTextContent("Click the teeth treated");
    expect(screen.getByTestId("dental-treatment-teeth-details")).toHaveTextContent(
      "No teeth selected",
    );
  });

  it("requires a treatment or procedure", async () => {
    renderPanel();

    fireEvent.click(screen.getByTestId("dental-treatment-header-save"));

    expect(
      await screen.findByText("Select the treatment or procedure."),
    ).toBeInTheDocument();
    expect(state.performMutateAsync).not.toHaveBeenCalled();
  });

  it("rejects a future treatment date", async () => {
    renderPanel();
    fireEvent.click(screen.getByTestId("pick-procedure"));
    fireEvent.change(screen.getByTestId("dental-treatment-date"), {
      target: { value: "2999-01-01" },
    });

    fireEvent.click(screen.getByTestId("dental-treatment-header-save"));

    expect(
      await screen.findByText("Treatment date cannot be in the future."),
    ).toBeInTheDocument();
    expect(state.performMutateAsync).not.toHaveBeenCalled();
  });

  it("saves the treatment with the selected teeth and lists their names", async () => {
    renderPanel();
    fireEvent.click(screen.getByTestId("pick-procedure"));
    fireEvent.click(screen.getByTestId("pick-tooth-36"));

    expect(await screen.findByTestId("dental-treatment-tooth-36")).toHaveTextContent(
      "36",
    );
    fireEvent.click(screen.getByTestId("dental-treatment-header-save"));

    await waitFor(() =>
      expect(state.performMutateAsync).toHaveBeenCalledWith({
        product_uuid: "prod-1",
        treatment_date: todayDateInputValue(),
        tooth_numbers: [36],
        surfaces: [],
        notes: "",
      }),
    );
    expect(screen.queryByTestId("dental-no-teeth-dialog")).not.toBeInTheDocument();
  });

  it("asks before saving without teeth and saves once confirmed", async () => {
    renderPanel();
    fireEvent.click(screen.getByTestId("pick-procedure"));

    fireEvent.click(screen.getByTestId("dental-treatment-header-save"));

    expect(await screen.findByTestId("dental-no-teeth-dialog")).toHaveTextContent(
      "No teeth details selected",
    );
    expect(state.performMutateAsync).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("dental-no-teeth-confirm"));

    await waitFor(() =>
      expect(state.performMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ product_uuid: "prod-1", tooth_numbers: [] }),
      ),
    );
  });

  it("returns to the form without saving when the user selects teeth instead", async () => {
    renderPanel();
    fireEvent.click(screen.getByTestId("pick-procedure"));
    fireEvent.click(screen.getByTestId("dental-treatment-header-save"));

    fireEvent.click(await screen.findByTestId("dental-no-teeth-cancel"));

    await waitFor(() =>
      expect(screen.queryByTestId("dental-no-teeth-dialog")).not.toBeInTheDocument(),
    );
    expect(state.performMutateAsync).not.toHaveBeenCalled();
  });

  it("lists treatments recorded this visit and expands details", () => {
    state.procedures = [
      {
        uuid: "t-1",
        product_uuid: "prod-1",
        procedure_name: "Extraction",
        procedure_code: "DEN-EXT",
        tooth_numbers: [48],
        surfaces: ["D"],
        treatment_status: "completed",
        treatment_date: "2026-10-18",
        notes: "Surgical",
        materials_used: "Gauze",
        diagnosis: "Impacted molar",
        performed_by_name: "Dr Molar",
        provider_name: "Dr Molar",
        actual_cost: "15000.00",
        visit_order_uuid: "order-1",
        plan_item_uuid: null,
        encounter_uuid: "enc-1",
        created_at: "2026-10-18T09:00:00Z",
        can_delete: true,
        can_edit: true,
      },
    ];
    renderPanel();

    const card = screen.getByTestId("dental-treatment-item-t-1");
    expect(card).toHaveTextContent("Extraction");
    expect(card).toHaveTextContent("Dr Molar");
    expect(card).not.toHaveTextContent("Teeth 48");
    expect(
      screen.queryByTestId("dental-treatment-status-t-1"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("dental-treatment-toggle-t-1"));

    expect(screen.getByTestId("dental-treatment-status-t-1")).toHaveTextContent(
      "completed",
    );
    expect(screen.getByTestId("dental-treatment-details-t-1")).toHaveTextContent(
      "48 ·",
    );
    expect(screen.getByTestId("dental-treatment-details-t-1")).toHaveTextContent(
      "Distal",
    );
    expect(screen.getByTestId("dental-treatment-details-t-1")).toHaveTextContent(
      "Impacted molar",
    );
    expect(screen.getByTestId("dental-treatment-details-t-1")).toHaveTextContent(
      "Gauze",
    );
    expect(screen.getByTestId("dental-treatment-details-t-1")).toHaveTextContent(
      "15000.00",
    );
    expect(screen.getByTestId("dental-treatment-delete-t-1")).toBeInTheDocument();
    expect(
      screen.getByTestId("dental-treatment-edit-teeth-t-1"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("dental-treatment-edit-surfaces-t-1"),
    ).toBeInTheDocument();
  });

  it("is read-only on a closed encounter", () => {
    state.isChartLocked = true;
    renderPanel();

    expect(screen.queryByTestId("dental-treatment-form")).not.toBeInTheDocument();
    expect(screen.getByTestId("opd-consult-form-locked")).toHaveTextContent(
      "This encounter is closed",
    );
  });
});
