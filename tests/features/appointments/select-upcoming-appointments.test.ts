import { describe, expect, it } from "vitest";

import { selectUpcomingAppointments } from "@/features/appointments/hooks/use-customer-appointments";
import type { Appointment } from "@/features/appointments/types/appointment.types";

function appointment(
  overrides: Partial<Appointment> & Pick<Appointment, "uuid" | "status" | "scheduled_start">,
): Appointment {
  return {
    id: 1,
    patient: "cust-1",
    patient_name: "Test Client",
    clinic: "clinic-1",
    clinic_name: "Main Clinic",
    department: "dept-1",
    department_name: "OPD",
    department_type: "opd",
    location: null,
    location_name: null,
    clinician: null,
    clinician_name: null,
    scheduled_end: overrides.scheduled_start,
    reason: "",
    notes: "",
    is_active: true,
    created_at: overrides.scheduled_start,
    updated_at: overrides.scheduled_start,
    ...overrides,
  };
}

describe("selectUpcomingAppointments", () => {
  it("keeps upcoming statuses sorted by start time and limited", () => {
    const selected = selectUpcomingAppointments(
      [
        appointment({
          uuid: "later",
          status: "scheduled",
          scheduled_start: "2026-09-26T10:00:00Z",
        }),
        appointment({
          uuid: "done",
          status: "completed",
          scheduled_start: "2026-09-20T10:00:00Z",
        }),
        appointment({
          uuid: "sooner",
          status: "confirmed",
          scheduled_start: "2026-09-25T08:00:00Z",
        }),
        appointment({
          uuid: "cancelled",
          status: "cancelled",
          scheduled_start: "2026-09-24T10:00:00Z",
        }),
      ],
      5,
    );

    expect(selected.map((item) => item.uuid)).toEqual(["sooner", "later"]);
  });
});
