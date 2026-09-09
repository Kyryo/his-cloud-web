import { describe, expect, it } from "vitest";

import type { Appointment } from "@/features/appointments/types/appointment.types";
import { groupAppointmentsByStatus } from "@/features/appointments/utils/appointment-board";

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

describe("groupAppointmentsByStatus", () => {
  it("keeps workflow columns and sorts each by start time", () => {
    const later = buildAppointment({
      uuid: "apt-2",
      scheduled_start: "2026-09-09T10:00:00.000Z",
      scheduled_end: "2026-09-09T10:30:00.000Z",
    });
    const earlier = buildAppointment({
      uuid: "apt-1",
      scheduled_start: "2026-09-09T08:00:00.000Z",
    });
    const confirmed = buildAppointment({
      uuid: "apt-3",
      status: "confirmed",
    });

    const columns = groupAppointmentsByStatus([later, confirmed, earlier]);

    expect(columns.map((column) => column.status)).toEqual([
      "scheduled",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "no_show",
      "rescheduled",
    ]);
    expect(columns[0]?.appointments.map((item) => item.uuid)).toEqual([
      "apt-1",
      "apt-2",
    ]);
    expect(columns[1]?.appointments.map((item) => item.uuid)).toEqual(["apt-3"]);
  });

  it("shows only the filtered status column", () => {
    const columns = groupAppointmentsByStatus(
      [
        buildAppointment({ uuid: "apt-1", status: "scheduled" }),
        buildAppointment({ uuid: "apt-2", status: "confirmed" }),
      ],
      "confirmed",
    );

    expect(columns).toHaveLength(1);
    expect(columns[0]?.status).toBe("confirmed");
    expect(columns[0]?.appointments).toHaveLength(1);
  });
});
