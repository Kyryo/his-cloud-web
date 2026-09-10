"use client";

import { format } from "date-fns";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppointmentsClinicianChip } from "@/features/appointments/components/AppointmentsClinicianChip";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import {
  APPOINTMENT_BOARD_ACCENT,
  APPOINTMENT_BOARD_LABELS,
} from "@/features/appointments/utils/appointment-board";
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
} from "@/features/appointments/utils/appointment-calendar.constants";
import { formatCalendarChipTime } from "@/features/appointments/utils/appointment-calendar-utils";
import { cn } from "@/lib/utils";

const SCHEDULE_HOURS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR },
  (_, index) => DAY_START_HOUR + index,
);

type AppointmentsCalendarDayScheduleProps = {
  day: Date;
  appointments: Appointment[];
  disabled?: boolean;
  onSchedule: (day: Date) => void;
  onAppointmentSelect?: (appointment: Appointment) => void;
};

export function AppointmentsCalendarDaySchedule({
  day,
  appointments,
  disabled = false,
  onSchedule,
  onAppointmentSelect,
}: AppointmentsCalendarDayScheduleProps) {
  return (
    <div
      className="min-w-[720px] bg-background"
      data-testid="appointments-day-view"
    >
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-4 py-3 sm:px-6">
        <p className="text-xs text-muted-foreground">
          {appointments.length} {appointments.length === 1 ? "visit" : "visits"} scheduled
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onSchedule(day)}
          className="h-8 gap-1.5 rounded-md px-2.5 text-xs text-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary"
        >
          <Plus className="size-3.5" />
          Add visit
        </Button>
      </div>

      <div>
        {SCHEDULE_HOURS.map((hour) => {
          const slotAppointments = appointments.filter(
            (appointment) =>
              new Date(appointment.scheduled_start).getHours() === hour,
          );
          const hourDate = new Date(day);
          hourDate.setHours(hour, 0, 0, 0);

          return (
            <div
              key={hour}
              className="grid min-h-20 grid-cols-[5rem_minmax(0,1fr)] border-b border-border/70 sm:grid-cols-[7rem_minmax(0,1fr)]"
            >
              <p className="sticky left-0 z-10 border-r border-border/70 bg-background px-4 pt-3 text-right text-[11px] font-medium tabular-nums text-muted-foreground sm:px-5">
                {format(hourDate, "h a")}
              </p>
              <div className="min-w-0">
                {slotAppointments.length === 0 ? (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSchedule(day)}
                    className="h-full min-h-20 w-full px-5 text-left text-xs text-transparent transition-colors hover:bg-brand-primary/[0.025] hover:text-muted-foreground focus-visible:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary"
                  >
                    Available
                  </button>
                ) : (
                  <div className="divide-y divide-border/70">
                    {slotAppointments.map((appointment) => (
                      <button
                        key={appointment.uuid}
                        type="button"
                        disabled={disabled}
                        onClick={() => onAppointmentSelect?.(appointment)}
                        className="group grid w-full grid-cols-[5rem_minmax(0,1fr)_auto] items-start gap-4 border-l-2 border-l-transparent px-5 py-3 text-left transition-colors hover:border-l-brand-primary hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary disabled:opacity-50"
                      >
                        <span className="text-xs font-semibold tabular-nums text-foreground">
                          {formatCalendarChipTime(appointment.scheduled_start)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-foreground group-hover:text-brand-primary">
                            {appointment.patient_name}
                          </span>
                          <span className="mt-1 block truncate text-xs text-muted-foreground">
                            {appointment.department_name}
                          </span>
                          <AppointmentsClinicianChip
                            name={appointment.clinician_name}
                            className="mt-1.5"
                          />
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                          <span
                            aria-hidden="true"
                            className={cn(
                              "size-1.5 rounded-full",
                              APPOINTMENT_BOARD_ACCENT[appointment.status],
                            )}
                          />
                          {APPOINTMENT_BOARD_LABELS[appointment.status]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
