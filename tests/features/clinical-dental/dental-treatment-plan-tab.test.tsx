import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DentalTreatmentPlanTabPanel } from "@/features/clinical-dental/components/DentalTreatmentPlanTabPanel";
import type { DentalTreatmentPlan } from "@/features/clinical-dental/types/clinical-dental.types";

const state = vi.hoisted(() => ({
  plans: [] as DentalTreatmentPlan[],
  capabilities: [] as string[],
  isChartLocked: false,
  performMutateAsync: vi.fn(),
  updatePlanMutateAsync: vi.fn(),
}));

function mutation(mutateAsync = vi.fn()) {
  return { mutateAsync, isPending: false };
}

vi.mock("@/features/clinical-dental/hooks/use-clinical-dental", () => ({
  useDentalTreatmentPlans: () => ({
    data: state.plans,
    isLoading: false,
    isError: false,
  }),
  useDentalProcedures: () => ({ data: [], isLoading: false }),
  useCreateDentalTreatmentPlan: () => mutation(),
  useUpdateDentalTreatmentPlan: () => mutation(state.updatePlanMutateAsync),
  useAddDentalPlanItem: () => mutation(),
  useUpdateDentalPlanItem: () => mutation(),
  usePerformDentalPlanItem: () => mutation(state.performMutateAsync),
  usePerformDentalProcedure: () => mutation(),
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

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

function plan(status: DentalTreatmentPlan["status"]): DentalTreatmentPlan {
  return {
    uuid: "plan-1",
    title: "Restore lower left",
    notes: "",
    status,
    accepted_at: null,
    completed_at: null,
    cancelled_at: null,
    created_at: "2026-10-17T09:00:00Z",
    created_by_name: "Dr Molar",
    encounter_uuid: "enc-1",
    visit_uuid: "visit-1",
    estimated_total: "15000.00",
    items: [
      {
        uuid: "item-1",
        product_uuid: "prod-1",
        product_name: "Composite filling",
        product_code: "DEN-FILL",
        tooth_numbers: [36, 37],
        surfaces: ["O"],
        sequence: 1,
        status: "planned",
        estimated_price: "15000.00",
        notes: "",
        performed_treatment_uuid: null,
        performed_at: null,
      },
    ],
  };
}

function renderPanel() {
  render(
    <DentalTreatmentPlanTabPanel visitUuid="visit-1" encounterUuid="enc-1" isActive />,
  );
}

beforeEach(() => {
  state.capabilities = ["manage_treatment_plan", "perform_dental_procedure"];
  state.isChartLocked = false;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("DentalTreatmentPlanTabPanel", () => {
  it("shows plan items with teeth, estimate and the plan total", () => {
    state.plans = [plan("draft")];
    renderPanel();

    expect(screen.getByTestId("dental-plan-status")).toHaveTextContent("Draft");
    expect(screen.getByTestId("dental-plan-item")).toHaveTextContent("36, 37 · O");
    expect(screen.getByTestId("dental-plan")).toHaveTextContent("Estimated 15000.00");
    expect(screen.queryByTestId("dental-plan-item-perform")).not.toBeInTheDocument();
  });

  it("accepts a draft plan", async () => {
    state.plans = [plan("draft")];
    state.updatePlanMutateAsync.mockResolvedValue({});
    renderPanel();

    fireEvent.click(screen.getByTestId("dental-plan-action-accepted"));

    await waitFor(() =>
      expect(state.updatePlanMutateAsync).toHaveBeenCalledWith({
        planUuid: "plan-1",
        payload: { status: "accepted" },
      }),
    );
  });

  it("performs a planned item of an accepted plan and bills it", async () => {
    state.plans = [plan("accepted")];
    state.performMutateAsync.mockResolvedValue({ uuid: "treatment-1" });
    renderPanel();

    fireEvent.click(screen.getByTestId("dental-plan-item-perform"));
    expect(screen.getByTestId("dental-perform-dialog")).toHaveTextContent(
      "Composite filling · teeth 36, 37 · O. It is added to the visit bill.",
    );
    fireEvent.click(screen.getByTestId("dental-perform-submit"));

    await waitFor(() =>
      expect(state.performMutateAsync).toHaveBeenCalledWith({
        itemUuid: "item-1",
        payload: { notes: "", materials_used: "" },
      }),
    );
  });

  it("is read-only without plan capabilities or on a closed encounter", () => {
    state.plans = [plan("accepted")];
    state.isChartLocked = true;
    renderPanel();

    expect(screen.queryByTestId("dental-new-plan")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dental-plan-item-perform")).not.toBeInTheDocument();
    expect(screen.getByTestId("opd-consult-form-locked")).toHaveTextContent(
      "This encounter is closed",
    );
  });
});
