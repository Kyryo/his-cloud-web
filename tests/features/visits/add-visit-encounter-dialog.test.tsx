import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AddVisitEncounterDialog } from "@/features/visits/components/AddVisitEncounterDialog";
import type { VisitDetail } from "@/features/visits/types/visit.types";

vi.mock("@/features/clinical/services/clinical-catalog.service", () => ({
  fetchClinicalDepartments: vi.fn().mockResolvedValue([
    {
      id: 1,
      uuid: "dept-opd",
      clinic: 1,
      clinic_name: "Main",
      name: "OPD",
      code: "OPD",
      department_type: "opd",
      status: "ACTIVE",
      is_active: true,
      walk_in_allowed: true,
      requires_appointment: false,
    },
    {
      id: 2,
      uuid: "dept-dental",
      clinic: 1,
      clinic_name: "Main",
      name: "Dental",
      code: "DENT",
      department_type: "dental",
      status: "ACTIVE",
      is_active: true,
      walk_in_allowed: true,
      requires_appointment: false,
    },
  ]),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

function buildVisit(overrides: Partial<VisitDetail> = {}): VisitDetail {
  return {
    id: 1,
    uuid: "visit-1",
    appointment: null,
    consultation_service: null,
    consultation_service_name: null,
    customer: "cust-1",
    customer_name: "Ada Lovelace",
    customer_identifier: "P-001",
    visit_date: "2026-09-24T08:00:00Z",
    status: "active",
    mark_for_completion: false,
    mode_of_payment: "cash",
    insurance_scheme: null,
    insurance_scheme_name: null,
    insurance_company_name: null,
    linked_sales_order_state: null,
    can_edit_mode_of_payment: true,
    mode_of_payment_edit_block_reason: null,
    requires_pre_authorization: false,
    pre_authorization_number: "",
    pre_authorization_comments: "",
    is_walk_in: true,
    is_active: true,
    clinic: "clinic-1",
    clinic_name: "Main",
    closed_by: null,
    created_by: null,
    created_by_name: null,
    encounters: [
      {
        id: 10,
        uuid: "enc-1",
        visit: "visit-1",
        department: "dept-opd",
        department_name: "OPD",
        department_type: "opd",
        location: null,
        location_name: null,
        clinician: null,
        clinician_name: null,
        status: "waiting",
        billing_mode: "shared_visit",
        started_at: null,
        ended_at: null,
        notes: "",
        is_active: true,
        created_by: null,
        created_at: "2026-09-24T08:00:00Z",
        updated_at: "2026-09-24T08:00:00Z",
      },
    ],
    created_at: "2026-09-24T08:00:00Z",
    updated_at: "2026-09-24T08:00:00Z",
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
});

describe("AddVisitEncounterDialog", () => {
  it("uses Save as the submit label and sectioned dialog chrome", async () => {
    render(
      <AddVisitEncounterDialog
        visit={buildVisit()}
        open
        onOpenChange={vi.fn()}
        onCreated={vi.fn()}
      />,
    );

    expect(screen.getByTestId("add-visit-encounter-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("add-encounter-submit")).toHaveTextContent("Save");
    expect(screen.queryByText("Add encounter")).not.toBeInTheDocument();
  });
});
