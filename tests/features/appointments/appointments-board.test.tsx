import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppointmentsBoard } from "@/features/appointments/components/AppointmentsBoard";
import { useAppointmentBoardStore } from "@/features/appointments/stores/appointment-board.store";
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
    location_name: null,
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

afterEach(() => {
  cleanup();
  useAppointmentBoardStore.getState().reset();
});

describe("AppointmentsBoard", () => {
  it("renders status columns and opens an appointment", () => {
    const onSelectAppointment = vi.fn();

    render(
      <AppointmentsBoard
        appointments={[
          buildAppointment(),
          buildAppointment({
            uuid: "apt-2",
            patient_name: "Grace Hopper",
            status: "confirmed",
          }),
        ]}
        onSelectAppointment={onSelectAppointment}
        onActionRequest={vi.fn()}
      />,
    );

    expect(screen.getByTestId("appointments-board")).toBeInTheDocument();
    expect(screen.queryByText("September 2026")).not.toBeInTheDocument();
    expect(screen.getByTestId("appointments-board-column-scheduled")).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Ada Lovelace"));
    expect(onSelectAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ uuid: "apt-1" }),
    );
  });
});
