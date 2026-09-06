import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AddVisitEncounterDialog } from "@/features/visits/components/AddVisitEncounterDialog";
import type { VisitDetail } from "@/features/visits/types/visit.types";

const fetchClinicalDepartments = vi.fn();
const createVisitEncounter = vi.fn();
const toast = vi.fn();

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast }),
}));

vi.mock("@/features/clinical/services/clinical-catalog.service", () => ({
  fetchClinicalDepartments: (...args: unknown[]) =>
    fetchClinicalDepartments(...args),
}));

vi.mock("@/features/visits/services/visits.service", () => ({
  createVisitEncounter: (...args: unknown[]) => createVisitEncounter(...args),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
  }) => (
    <div data-testid="mock-select" data-value={value ?? ""}>
      <button
        type="button"
        data-testid="mock-select-pick"
        onClick={() => {
          if (onValueChange) {
            onValueChange(value ? "separate_department" : "dept-dental");
          }
        }}
      >
        Pick
      </button>
      {children}
    </div>
  ),
  SelectTrigger: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    id?: string;
    "data-testid"?: string;
  }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: () => null,
}));

const visit = {
  uuid: "visit-1",
  clinic_name: "Main Clinic",
} as VisitDetail;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AddVisitEncounterDialog billing mode", () => {
  beforeEach(() => {
    fetchClinicalDepartments.mockResolvedValue([
      {
        uuid: "dept-dental",
        name: "Dental",
        clinic_name: "Main Clinic",
      },
    ]);
    createVisitEncounter.mockResolvedValue({
      uuid: "enc-2",
      department_name: "Dental",
      billing_mode: "separate_department",
    });
  });

  it("requires billing mode choice and submits it with the encounter", async () => {
    const onCreated = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <AddVisitEncounterDialog
        visit={visit}
        open
        onOpenChange={onOpenChange}
        onCreated={onCreated}
      />,
    );

    expect(
      await screen.findByTestId("add-encounter-billing-mode"),
    ).toBeInTheDocument();

    const pickButtons = await screen.findAllByTestId("mock-select-pick");
    fireEvent.click(pickButtons[0]);
    fireEvent.click(pickButtons[1]);
    fireEvent.click(screen.getByTestId("add-encounter-submit"));

    await waitFor(() => {
      expect(createVisitEncounter).toHaveBeenCalledWith("visit-1", {
        department: "dept-dental",
        billing_mode: "separate_department",
      });
    });
    expect(onCreated).toHaveBeenCalled();
  });
});
