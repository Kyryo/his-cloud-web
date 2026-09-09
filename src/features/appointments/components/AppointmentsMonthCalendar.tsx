"use client";

import { format, isSameMonth, startOfMonth } from "date-fns";
import { useMemo, useState } from "react";

import { AppointmentsCalendarAgenda } from "@/features/appointments/components/AppointmentsCalendarAgenda";
import { cn } from "@/lib/utils";
import { AppointmentsCalendarDayCell } from "@/features/appointments/components/AppointmentsCalendarDayCell";
import { AppointmentsCalendarNav } from "@/features/appointments/components/AppointmentsCalendarNav";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import {
  getCalendarMonthDays,
  groupAppointmentsByDay,
  isInVisibleMonth,
  isToday,
} from "@/features/appointments/utils/appointment-calendar-utils";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type AppointmentsMonthCalendarProps = {
  visibleMonth: Date;
  appointments: Appointment[];
  isLoading?: boolean;
  onVisibleMonthChange: (month: Date) => void;
  onDaySelect: (day: Date) => void;
  onAppointmentSelect?: (appointment: Appointment) => void;
};

export function AppointmentsMonthCalendar({
  visibleMonth,
  appointments,
  isLoading = false,
  onVisibleMonthChange,
  onDaySelect,
  onAppointmentSelect,
}: AppointmentsMonthCalendarProps) {
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const agendaDay = isSameMonth(selectedDay, visibleMonth) ? selectedDay : startOfMonth(visibleMonth);
  const appointmentsByDay = useMemo(
    () => groupAppointmentsByDay(appointments),
    [appointments],
  );
  const calendarDays = useMemo(
    () => getCalendarMonthDays(visibleMonth),
    [visibleMonth],
  );
  const weekCount = Math.ceil(calendarDays.length / 7);

  return (
    <div
      className="-mx-4 flex min-h-0 flex-1 flex-col md:-mx-6"
      data-testid="appointments-month-calendar"
    >
      <div className="grid min-h-0 grid-cols-1 border-y border-border bg-background xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 overflow-x-auto bg-background">
          <div className="flex min-w-[700px] flex-col">
            <AppointmentsCalendarNav
              visibleMonth={visibleMonth}
              isLoading={isLoading}
              onVisibleMonthChange={onVisibleMonthChange}
            />
            <div className="grid grid-cols-7 border-b border-border bg-muted/30">
              {WEEKDAY_LABELS.map((label) => (
                <div
                  key={label}
                  className="px-3 py-2.5 text-right text-[11px] font-semibold text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>

            <div
              className={cn(
                "grid grid-cols-7",
                weekCount === 6
                  ? "grid-rows-6"
                  : weekCount === 5
                    ? "grid-rows-5"
                    : "grid-rows-4",
              )}
            >
              {calendarDays.map((day) => {
                const dayKey = format(day, "yyyy-MM-dd");
                const weekday = day.getDay();

                return (
                  <AppointmentsCalendarDayCell
                    key={dayKey}
                    day={day}
                    appointments={appointmentsByDay.get(dayKey) ?? []}
                    inMonth={isInVisibleMonth(day, visibleMonth)}
                    isToday={isToday(day)}
                    isWeekend={weekday === 0 || weekday === 6}
                    disabled={isLoading}
                    selected={format(agendaDay, "yyyy-MM-dd") === dayKey}
                    onDaySelect={(selected) => {
                      setSelectedDay(selected);
                      if (!isSameMonth(selected, visibleMonth)) {
                        onVisibleMonthChange(startOfMonth(selected));
                      }
                    }}
                    onAppointmentSelect={onAppointmentSelect}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <AppointmentsCalendarAgenda
          day={agendaDay}
          appointments={appointmentsByDay.get(format(agendaDay, "yyyy-MM-dd")) ?? []}
          disabled={isLoading}
          onSchedule={() => onDaySelect(agendaDay)}
          onAppointmentSelect={onAppointmentSelect}
        />
      </div>
    </div>
  );
}
