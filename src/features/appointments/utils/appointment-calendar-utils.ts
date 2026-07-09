import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import type { Appointment } from "@/features/appointments/types/appointment.types";
import {
  APPOINTMENT_COUNT_BADGE_MAX,
  DAY_END_HOUR,
  DAY_START_HOUR,
  DEFAULT_SLOT_MINUTES,
} from "@/features/appointments/utils/appointment-calendar.constants";

export type DaySlot = {
  start: Date;
  end: Date;
  startLabel: string;
  endLabel: string;
};

export type MappedSlot = DaySlot & {
  status: "booked" | "available";
  appointment?: Appointment;
};

export function getAppointmentDayKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return format(date, "yyyy-MM-dd");
}

export function resolveAppointmentRangeBounds(
  visibleMonth: Date,
  filters: { scheduledFrom: string; scheduledTo: string },
): { scheduledFrom: string; scheduledTo: string } {
  const monthStart = format(startOfMonth(visibleMonth), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(visibleMonth), "yyyy-MM-dd");

  let from = monthStart;
  let to = monthEnd;

  if (filters.scheduledFrom && filters.scheduledFrom > from) {
    from = filters.scheduledFrom;
  }
  if (filters.scheduledTo && filters.scheduledTo < to) {
    to = filters.scheduledTo;
  }

  return { scheduledFrom: from, scheduledTo: to };
}

export function groupAppointmentsByDay(
  appointments: Appointment[],
): Map<string, Appointment[]> {
  const grouped = new Map<string, Appointment[]>();

  for (const appointment of appointments) {
    const dayKey = getAppointmentDayKey(appointment.scheduled_start);
    if (!dayKey) {
      continue;
    }

    const existing = grouped.get(dayKey) ?? [];
    existing.push(appointment);
    grouped.set(dayKey, existing);
  }

  for (const dayAppointments of grouped.values()) {
    dayAppointments.sort(
      (left, right) =>
        new Date(left.scheduled_start).getTime() -
        new Date(right.scheduled_start).getTime(),
    );
  }

  return grouped;
}

export function countAppointmentsByDay(
  appointments: Appointment[],
): Map<string, number> {
  const grouped = groupAppointmentsByDay(appointments);
  const counts = new Map<string, number>();

  for (const [dayKey, dayAppointments] of grouped) {
    counts.set(dayKey, dayAppointments.length);
  }

  return counts;
}

export function formatAppointmentCountBadge(count: number): string | null {
  if (count <= 0) {
    return null;
  }

  if (count > APPOINTMENT_COUNT_BADGE_MAX) {
    return `${APPOINTMENT_COUNT_BADGE_MAX}+`;
  }

  return String(count);
}

export function getCalendarMonthDays(visibleMonth: Date): Date[] {
  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isInVisibleMonth(date: Date, visibleMonth: Date): boolean {
  return isSameMonth(date, visibleMonth);
}

export function resolveDepartmentSlotMinutes(
  duration?: number | null,
): number {
  if (typeof duration === "number" && duration > 0) {
    return duration;
  }

  return DEFAULT_SLOT_MINUTES;
}

export function generateDaySlots(
  day: Date,
  slotMinutes: number = DEFAULT_SLOT_MINUTES,
): DaySlot[] {
  const slots: DaySlot[] = [];
  const dayStart = new Date(day);
  dayStart.setHours(DAY_START_HOUR, 0, 0, 0);

  const dayEnd = new Date(day);
  dayEnd.setHours(DAY_END_HOUR, 0, 0, 0);

  let current = new Date(dayStart);

  while (current < dayEnd) {
    const slotEnd = addDays(current, 0);
    slotEnd.setTime(current.getTime() + slotMinutes * 60_000);

    if (slotEnd > dayEnd) {
      break;
    }

    slots.push({
      start: new Date(current),
      end: new Date(slotEnd),
      startLabel: format(current, "h:mm a"),
      endLabel: format(slotEnd, "h:mm a"),
    });

    current = slotEnd;
  }

  return slots;
}

function appointmentOverlapsSlot(
  slotStart: Date,
  slotEnd: Date,
  appointment: Appointment,
): boolean {
  const appointmentStart = new Date(appointment.scheduled_start);
  const appointmentEnd = new Date(appointment.scheduled_end);

  if (
    Number.isNaN(appointmentStart.getTime()) ||
    Number.isNaN(appointmentEnd.getTime())
  ) {
    return false;
  }

  return appointmentStart < slotEnd && appointmentEnd > slotStart;
}

export function mapAppointmentsToSlots(
  slots: DaySlot[],
  appointments: Appointment[],
  clinicianId: number | null,
): MappedSlot[] {
  const providerAppointments = clinicianId
    ? appointments.filter((appointment) => appointment.clinician === clinicianId)
    : [];

  return slots.map((slot) => {
    const appointment = providerAppointments.find((candidate) =>
      appointmentOverlapsSlot(slot.start, slot.end, candidate),
    );

    if (appointment) {
      return {
        ...slot,
        status: "booked",
        appointment,
      };
    }

    return {
      ...slot,
      status: "available",
    };
  });
}

export function getUnassignedAppointmentsForDay(
  appointments: Appointment[],
): Appointment[] {
  return appointments.filter((appointment) => !appointment.clinician);
}

export function toLocalDateTimeInputFromDate(date: Date): string {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}
