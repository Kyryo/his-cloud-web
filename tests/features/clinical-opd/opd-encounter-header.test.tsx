import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { OpdEncounterHeader } from "@/features/clinical-opd/components/detail/OpdEncounterHeader";
import { OpdEncounterWorkspaceProvider } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";
import type { Customer } from "@/features/customers/types/customer.types";

afterEach(() => {
  cleanup();
});

const customer: Customer = {
  id: 101,
  uuid: "cust-101",
  tenant: 1,
  first_name: "Thoko",
  middle_name: null,
  last_name: "Phiri",
  full_name: "Thoko Phiri",
  customer_identifier: "MRN-1001",
  internal_reference: "REF-001",
  phone_number: "+265991234567",
  email: "thoko.phiri@example.com",
  patient_uuid: "pat-101",
  gender: "Female",
  dob: "1994-05-15",
  dob_is_estimated: false,
  age: 32,
  has_synced_to_openmrs: false,
  is_active: true,
  visit_status: "active",
  created_at: "2026-01-10T08:00:00Z",
  updated_at: "2026-01-10T08:00:00Z",
  created_by: null,
};

const encounter: OpdQueueEncounter = {
  encounter_uuid: "enc-1",
  visit_uuid: "visit-1",
  visit_status: "active",
  customer_uuid: "cust-101",
  customer_name: "Thoko Phiri",
  customer_identifier: "MRN-1001",
  department_name: "Outpatient",
  status: "in_progress",
  started_at: new Date().toISOString(),
  mode_of_payment: "cash",
  insurance_scheme_name: null,
};

function renderHeader() {
  return render(
    <OpdEncounterWorkspaceProvider
      value={{
        visitUuid: "visit-1",
        encounterUuid: "enc-1",
        encounter,
        customer,
        capabilities: [],
        visibleTabIds: [],
        userRole: "physician",
        chartSummary: null,
        isChartLocked: false,
      }}
    >
      <OpdEncounterHeader customer={customer} />
    </OpdEncounterWorkspaceProvider>,
  );
}

describe("OpdEncounterHeader", () => {
  it("leads with client identity and a status badge", () => {
    renderHeader();

    expect(screen.getByRole("heading", { name: "Thoko Phiri" })).toBeInTheDocument();
    expect(screen.getByText(/MRN-1001 · Female · \d+ years/)).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.queryByText("DOB:")).not.toBeInTheDocument();
  });

  it("breaks encounter context into scannable facts", () => {
    renderHeader();

    expect(screen.getByTestId("opd-encounter-fact-department")).toHaveTextContent(
      "Outpatient",
    );
    expect(screen.getByTestId("opd-encounter-fact-started")).toHaveTextContent(
      "Started just now",
    );
    expect(screen.getByTestId("opd-encounter-fact-payment")).toHaveTextContent(
      "Cash",
    );
  });
});
