import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppointmentDetailOverview } from "@/features/appointments/components/AppointmentDetailOverview";
import type { Appointment } from "@/features/appointments/types/appointment.types";

function buildAppointment(
  overrides: Partial<Appointment> = {},
): Appointment {
  return {
    id: 1,
    uuid: "apt-1",
    patient: "cust-1",
    patient_name: "Ada Lovelace",
    clinic: "clinic-1",
    clinic_name: "Main Clinic",
    department: "dept-1",
    department_name: "Outpatient",
    department_type: "opd",
    location: null,
    location_name: "Room 2",
    clinician: 9,
    clinician_name: "Dr. House",
    scheduled_start: "2026-09-09T08:00:00.000Z",
    scheduled_end: "2026-09-09T08:30:00.000Z",
    status: "scheduled",
    reason: "Follow-up",
    notes: "",
    is_active: true,
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("AppointmentDetailOverview", () => {
  it("renders schedule, location, and empty notes clearly", () => {
    render(<AppointmentDetailOverview appointment={buildAppointment()} />);

    expect(screen.getByTestId("appointment-detail-overview")).toBeInTheDocument();
    expect(screen.getByText("When")).toBeInTheDocument();
    expect(screen.getByText(/30 minutes/)).toBeInTheDocument();
    expect(screen.getByText("Dr. House")).toBeInTheDocument();
    expect(screen.getByText("Main Clinic")).toBeInTheDocument();
    expect(screen.getByText("Outpatient · Room 2")).toBeInTheDocument();
    expect(screen.getByText("Follow-up")).toBeInTheDocument();
    expect(screen.getByText("None added")).toBeInTheDocument();
  });
});
