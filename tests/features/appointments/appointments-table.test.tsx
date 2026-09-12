import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppointmentsTable } from "@/features/appointments/components/tables/appointments-table";
import type { Appointment } from "@/features/appointments/types/appointment.types";

afterEach(() => {
  cleanup();
});

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 1,
    uuid: "appt-1",
    patient: "patient-1",
    patient_name: "Jane Doe",
    clinic: "clinic-1",
    clinic_name: "Main Clinic",
    department: "dept-1",
    department_name: "General",
    department_type: "outpatient",
    location: null,
    location_name: null,
    clinician: 10,
    clinician_name: "Dr. Smith",
    scheduled_start: "2026-07-09T10:00:00.000Z",
    scheduled_end: "2026-07-09T10:30:00.000Z",
    status: "scheduled",
    reason: "",
    notes: "",
    is_active: true,
    created_at: "2026-07-09T10:00:00.000Z",
    updated_at: "2026-07-09T10:00:00.000Z",
    ...overrides,
  };
}

describe("AppointmentsTable", () => {
  it("shows a letter avatar for the client and a start visit action", () => {
    const onActionRequest = vi.fn();

    render(
      <AppointmentsTable
        appointments={[makeAppointment()]}
        actionUuid={null}
        onRowClick={vi.fn()}
        onActionRequest={onActionRequest}
      />,
    );

    expect(screen.getByText("JD")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();

    const startVisit = screen.getByTestId("appointments-start-visit");
    expect(startVisit).toHaveTextContent("Start visit");
    expect(startVisit.className).toContain("rounded-md");
    expect(startVisit.className).toContain("border-dash-border");
    expect(startVisit.className).not.toContain("bg-brand-primary");

    fireEvent.click(startVisit);
    expect(onActionRequest).toHaveBeenCalledWith(
      expect.objectContaining({ uuid: "appt-1" }),
      "start",
    );
  });
});
