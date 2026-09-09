import { beforeEach, describe, expect, it } from "vitest";

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

describe("appointment board store", () => {
  beforeEach(() => {
    useAppointmentBoardStore.getState().reset();
  });

  it("moves a card and can roll the change back", () => {
    const appointment = buildAppointment();
    useAppointmentBoardStore.getState().hydrate([appointment]);

    const previous = useAppointmentBoardStore
      .getState()
      .moveToStatus("apt-1", "confirmed");

    expect(previous?.status).toBe("scheduled");
    expect(useAppointmentBoardStore.getState().appointments[0]?.status).toBe(
      "confirmed",
    );

    useAppointmentBoardStore.getState().revert("apt-1");
    expect(useAppointmentBoardStore.getState().appointments[0]?.status).toBe(
      "scheduled",
    );
  });

  it("keeps an in-flight move when the list is rehydrated", () => {
    useAppointmentBoardStore.getState().hydrate([buildAppointment()]);
    useAppointmentBoardStore.getState().moveToStatus("apt-1", "cancelled");
    useAppointmentBoardStore.getState().hydrate([
      buildAppointment({ status: "scheduled" }),
    ]);

    expect(useAppointmentBoardStore.getState().appointments[0]?.status).toBe(
      "cancelled",
    );

    useAppointmentBoardStore.getState().commit("apt-1");
    useAppointmentBoardStore.getState().hydrate([
      buildAppointment({ status: "cancelled" }),
    ]);
    expect(useAppointmentBoardStore.getState().appointments[0]?.status).toBe(
      "cancelled",
    );
  });
});
