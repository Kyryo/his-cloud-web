import { describe, expect, it } from "vitest";

import type { Appointment } from "@/features/appointments/types/appointment.types";
import {
  countAppointmentsByDay,
  formatAppointmentCountBadge,
  generateDaySlots,
  getAppointmentDayKey,
  mapAppointmentsToSlots,
  resolveAppointmentRangeBounds,
  resolveDepartmentSlotMinutes,
} from "@/features/appointments/utils/appointment-calendar-utils";

function makeAppointment(
  overrides: Partial<Appointment> & Pick<Appointment, "scheduled_start" | "scheduled_end">,
): Appointment {
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
    status: "scheduled",
    reason: "",
    notes: "",
    is_active: true,
    created_at: "2026-07-09T10:00:00.000Z",
    updated_at: "2026-07-09T10:00:00.000Z",
    ...overrides,
  };
}

describe("appointment-calendar-utils", () => {
  it("groups appointments by local day key", () => {
    const appointment = makeAppointment({
      scheduled_start: "2026-07-09T10:00:00.000Z",
      scheduled_end: "2026-07-09T10:30:00.000Z",
    });

    const counts = countAppointmentsByDay([appointment]);
    const dayKey = getAppointmentDayKey(appointment.scheduled_start);

    expect(dayKey).toBeTruthy();
    expect(counts.get(dayKey)).toBe(1);
  });

  it("caps appointment count badges at 99+", () => {
    expect(formatAppointmentCountBadge(0)).toBeNull();
    expect(formatAppointmentCountBadge(5)).toBe("5");
    expect(formatAppointmentCountBadge(100)).toBe("99+");
  });

  it("intersects visible month with manual date filters", () => {
    const bounds = resolveAppointmentRangeBounds(new Date("2026-07-15"), {
      scheduledFrom: "2026-07-10",
      scheduledTo: "2026-08-01",
    });

    expect(bounds).toEqual({
      scheduledFrom: "2026-07-10",
      scheduledTo: "2026-07-31",
    });
  });

  it("generates 30-minute slots between 8am and 6pm by default", () => {
    const slots = generateDaySlots(new Date("2026-07-09T12:00:00"));
    expect(slots.length).toBe(20);
    expect(slots[0]?.start.getHours()).toBe(8);
    expect(slots.at(-1)?.end.getHours()).toBe(18);
  });

  it("uses department duration when provided", () => {
    const slots = generateDaySlots(new Date("2026-07-09T12:00:00"), 45);
    expect(slots.length).toBe(13);
    expect(slots[0]?.end.getTime() - slots[0]!.start.getTime()).toBe(45 * 60_000);
  });

  it("falls back to 30 minutes when department duration is missing", () => {
    expect(resolveDepartmentSlotMinutes(null)).toBe(30);
    expect(resolveDepartmentSlotMinutes(undefined)).toBe(30);
    expect(resolveDepartmentSlotMinutes(0)).toBe(30);
    expect(resolveDepartmentSlotMinutes(45)).toBe(45);
  });

  it("marks overlapping provider appointments as booked slots", () => {
    const day = new Date("2026-07-09T12:00:00");
    const slots = generateDaySlots(day);
    const slot = slots[4];
    if (!slot) {
      throw new Error("Expected a generated slot");
    }

    const appointment = makeAppointment({
      clinician: 10,
      scheduled_start: slot.start.toISOString(),
      scheduled_end: slot.end.toISOString(),
    });

    const mapped = mapAppointmentsToSlots(slots, [appointment], 10);
    const booked = mapped.find((entry) => entry.status === "booked");

    expect(booked?.appointment?.uuid).toBe("appt-1");
  });
});
