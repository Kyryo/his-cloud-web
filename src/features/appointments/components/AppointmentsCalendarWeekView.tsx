"use client";

import { format, isSameDay } from "date-fns";

import type { Appointment } from "@/features/appointments/types/appointment.types";
import {
  APPOINTMENT_BOARD_ACCENT,
  APPOINTMENT_BOARD_LABELS,
} from "@/features/appointments/utils/appointment-board";
import { formatCalendarChipTime } from "@/features/appointments/utils/appointment-calendar-utils";
import { cn } from "@/lib/utils";

type AppointmentsCalendarWeekViewProps = {
  days: Date[];
  appointmentsByDay: Map<string, Appointment[]>;
  disabled?: boolean;
  onDayOpen: (day: Date) => void;
  onSchedule: (day: Date) => void;
  onAppointmentSelect?: (appointment: Appointment) => void;
};

export function AppointmentsCalendarWeekView({
  days,
  appointmentsByDay,
  disabled = false,
  onDayOpen,
  onSchedule,
  onAppointmentSelect,
}: AppointmentsCalendarWeekViewProps) {
  return (
    <div
      className="max-h-[calc(100dvh-14rem)] overflow-auto overscroll-contain"
      data-testid="appointments-week-view"
    >
      <div className="grid min-h-[620px] min-w-[980px] grid-cols-7 divide-x divide-border">
        {days.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayAppointments = appointmentsByDay.get(dayKey) ?? [];
          const today = isSameDay(day, new Date());

          return (
            <section key={dayKey} className="min-w-0 bg-background">
              <button
                type="button"
                disabled={disabled}
                aria-label={`Open ${format(day, "EEEE, d MMMM")} day view`}
                onClick={() => onDayOpen(day)}
                className="sticky top-0 z-10 flex h-[74px] w-full items-center justify-between border-b border-border bg-background px-3 text-left transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary"
              >
                <span>
                  <span className="block text-[11px] font-medium text-muted-foreground">
                    {format(day, "EEE")}
                  </span>
                  <span
                    className={cn(
                      "mt-1 flex size-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
                      today && "bg-brand-primary text-white",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </span>
                <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                  {dayAppointments.length}
                </span>
              </button>

              <div className="divide-y divide-border/70">
                {dayAppointments.map((appointment) => (
                  <button
                    key={appointment.uuid}
                    type="button"
                    disabled={disabled}
                    onClick={() => onAppointmentSelect?.(appointment)}
                    className="group w-full border-l-2 border-l-transparent px-3 py-3 text-left transition-colors hover:border-l-brand-primary hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary disabled:opacity-50"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold tabular-nums text-foreground">
                        {formatCalendarChipTime(appointment.scheduled_start)}
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          APPOINTMENT_BOARD_ACCENT[appointment.status],
                        )}
                      />
                    </span>
                    <span className="mt-1.5 block truncate text-xs font-semibold text-foreground group-hover:text-brand-primary">
                      {appointment.patient_name}
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                      {appointment.clinician_name || "Unassigned"}
                    </span>
                    <span className="sr-only">
                      {APPOINTMENT_BOARD_LABELS[appointment.status]}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSchedule(day)}
                  className="w-full px-3 py-3 text-left text-[11px] font-medium text-muted-foreground transition-colors hover:bg-brand-primary/5 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary"
                >
                  + Add visit
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
