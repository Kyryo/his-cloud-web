import type { Appointment } from "@/features/appointments/types/appointment.types";

export function canStartAppointmentVisit(appointment: Appointment) {
  return appointment.status === "scheduled" || appointment.status === "confirmed";
}

export function canConfirmAppointment(appointment: Appointment) {
  return appointment.status === "scheduled";
}

export function canCancelAppointment(appointment: Appointment) {
  return appointment.status === "scheduled" || appointment.status === "confirmed";
}

export function canMarkAppointmentNoShow(appointment: Appointment) {
  return appointment.status === "scheduled" || appointment.status === "confirmed";
}
