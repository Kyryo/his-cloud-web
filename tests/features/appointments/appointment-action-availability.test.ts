import { describe, expect, it } from "vitest";

import type { Appointment } from "@/features/appointments/types/appointment.types";
import {
  canCancelAppointment,
  canConfirmAppointment,
  canStartAppointmentVisit,
} from "@/features/appointments/utils/appointment-action-availability";

const appointment = { status: "scheduled" } as Appointment;
const confirmed = { status: "confirmed" } as Appointment;
const completed = { status: "completed" } as Appointment;

describe("appointment action availability", () => {
  it("allows start, confirm, and cancel on scheduled appointments", () => {
    expect(canStartAppointmentVisit(appointment)).toBe(true);
    expect(canConfirmAppointment(appointment)).toBe(true);
    expect(canCancelAppointment(appointment)).toBe(true);
  });

  it("locks confirm on confirmed appointments and all actions after completion", () => {
    expect(canStartAppointmentVisit(confirmed)).toBe(true);
    expect(canConfirmAppointment(confirmed)).toBe(false);
    expect(canCancelAppointment(confirmed)).toBe(true);
    expect(canStartAppointmentVisit(completed)).toBe(false);
    expect(canCancelAppointment(completed)).toBe(false);
  });
});
