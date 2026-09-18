import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useForm } from "react-hook-form";

import { Form } from "@/components/ui/form";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import {
  StartVisitFormFields,
  type StartVisitStep,
} from "@/features/visits/components/StartVisitFormFields";
import {
  createStartVisitDefaultValues,
  type StartVisitFormValues,
} from "@/features/visits/schemas/start-visit.schema";

afterEach(() => {
  cleanup();
});

function StartVisitFormHarness({
  insuranceSchemes = [],
  department = "dept-1",
  step = "visit",
  onStepChange = vi.fn(),
}: {
  insuranceSchemes?: Array<{
    uuid: string;
    scheme_name: string;
    insurance_company_name: string;
  }>;
  department?: string;
  step?: StartVisitStep;
  onStepChange?: (step: StartVisitStep) => void;
}) {
  const form = useForm<StartVisitFormValues>({
    defaultValues: createStartVisitDefaultValues({
      clinic: "clinic-1",
      department,
    }),
  });

  return (
    <Form {...form}>
      <StartVisitFormFields
        form={form}
        step={step}
        onStepChange={onStepChange}
        defaultClinicName="City Clinic"
        departments={[
          {
            id: 1,
            uuid: "dept-1",
            clinic: 1,
            clinic_name: "City Clinic",
            name: "Outpatient",
            code: "OPD",
            department_type: "opd",
            status: "active",
            is_active: true,
            walk_in_allowed: true,
            requires_appointment: false,
          },
        ]}
        consultationServices={[
          {
            id: 1,
            uuid: "svc-1",
            name: "General consultation",
            code: "GEN",
            is_chargable: true,
            is_active: true,
          },
        ]}
        insuranceSchemes={insuranceSchemes.map(
          (scheme): CustomerInsurance => ({
            id: 1,
            uuid: scheme.uuid,
            customer: 1,
            insurance_scheme: 1,
            scheme_name: scheme.scheme_name,
            insurance_company_name: scheme.insurance_company_name,
            insurance_company_code: "MASM",
            membership_number: "M-1",
            suffix: "",
            is_principal_member: true,
            principal_member_name: "",
            relationship_to_principal_member: "Self",
            is_primary: true,
            date_joined: "2026-01-01",
            pricelist_id: null,
            is_active: true,
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
          }),
        )}
        customerUuid="b6b3954f-9f77-4c19-a087-fe91fd302a8a"
        consultationServiceSearch=""
        onConsultationServiceSearchChange={vi.fn()}
        selectedClinicId={1}
      />
    </Form>
  );
}

describe("StartVisitFormFields", () => {
  it("shows visit fields on the first step", () => {
    render(<StartVisitFormHarness />);

    expect(screen.getByRole("button", { name: "Visit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Payment" })).toBeInTheDocument();
    expect(screen.getByText("Department")).toBeInTheDocument();
    expect(screen.getByText("City Clinic")).toBeInTheDocument();
    expect(screen.getByText("Arrived")).toBeInTheDocument();
    expect(screen.getByTestId("start-visit-datetime")).toBeInTheDocument();
    expect(document.querySelector("input[type='datetime-local']")).toBeNull();
    expect(screen.getByText("Service")).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: /Cash/i })).not.toBeInTheDocument();
    expect(screen.queryByText("Scheme")).not.toBeInTheDocument();
  });

  it("waits for a department before enabling services", () => {
    render(<StartVisitFormHarness department="" />);

    expect(screen.getByText("Select a department first")).toBeInTheDocument();
    expect(
      screen.getByTestId("start-visit-consultation-service"),
    ).toBeDisabled();
  });

  it("shows payment fields on the second step", () => {
    render(
      <StartVisitFormHarness
        step="payment"
        insuranceSchemes={[
          {
            uuid: "scheme-1",
            scheme_name: "MASM Corporate",
            insurance_company_name: "MASM",
          },
        ]}
      />,
    );

    expect(screen.getByRole("radio", { name: /Cash/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Insurance/i })).toBeInTheDocument();
    expect(screen.queryByText("Department")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: /Insurance/i }));

    expect(screen.getByText("Scheme")).toBeInTheDocument();
    expect(screen.getByText("Pre-authorization required")).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Requires pre-authorization" }),
    ).toBeInTheDocument();
  });

  it("hides the scheme field and links to client insurance when none is assigned", () => {
    render(<StartVisitFormHarness step="payment" />);

    fireEvent.click(screen.getByRole("radio", { name: /Insurance/i }));

    expect(screen.queryByText("Scheme")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Pre-authorization required"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This client has no insurance assigned.",
    );
    expect(screen.getByRole("link", { name: "Add insurance" })).toHaveAttribute(
      "href",
      "/customers/b6b3954f-9f77-4c19-a087-fe91fd302a8a/insurance",
    );
  });
});
