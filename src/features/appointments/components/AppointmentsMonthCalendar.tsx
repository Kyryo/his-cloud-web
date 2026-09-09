"use client";

import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { AppointmentsCalendarAgenda } from "@/features/appointments/components/AppointmentsCalendarAgenda";
import { AppointmentsCalendarDaySchedule } from "@/features/appointments/components/AppointmentsCalendarDaySchedule";
import { AppointmentsCalendarDayCell } from "@/features/appointments/components/AppointmentsCalendarDayCell";
import { AppointmentsCalendarNav } from "@/features/appointments/components/AppointmentsCalendarNav";
import { AppointmentsCalendarWeekView } from "@/features/appointments/components/AppointmentsCalendarWeekView";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import {
  getCalendarMonthDays,
  groupAppointmentsByDay,
  isInVisibleMonth,
  isToday,
} from "@/features/appointments/utils/appointment-calendar-utils";
import {
  APPOINTMENTS_CALENDAR_VIEW_PARAM,
  appointmentsCalendarHref,
  parseAppointmentsCalendarView,
} from "@/features/appointments/utils/appointment-views";
import { cn } from "@/lib/utils";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const calendarView = parseAppointmentsCalendarView(
    searchParams.get(APPOINTMENTS_CALENDAR_VIEW_PARAM),
  );
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const agendaDay = isSameMonth(selectedDay, visibleMonth)
    ? selectedDay
    : startOfMonth(visibleMonth);
  const appointmentsByDay = useMemo(
    () => groupAppointmentsByDay(appointments),
    [appointments],
  );
  const calendarDays = useMemo(
    () => getCalendarMonthDays(visibleMonth),
    [visibleMonth],
  );
  const weekCount = Math.ceil(calendarDays.length / 7);
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(agendaDay);
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [agendaDay]);

  function changeFocusDate(nextDate: Date) {
    setSelectedDay(nextDate);
    if (!isSameMonth(nextDate, visibleMonth)) {
      onVisibleMonthChange(startOfMonth(nextDate));
    }
  }

  function handleNavigate(direction: -1 | 1) {
    if (calendarView === "month") {
      const nextMonth = addMonths(visibleMonth, direction);
      setSelectedDay(startOfMonth(nextMonth));
      onVisibleMonthChange(startOfMonth(nextMonth));
      return;
    }

    changeFocusDate(
      calendarView === "week"
        ? addWeeks(agendaDay, direction)
        : addDays(agendaDay, direction),
    );
  }

  function handleToday() {
    const today = new Date();
    setSelectedDay(today);
    if (!isSameMonth(today, visibleMonth)) {
      onVisibleMonthChange(startOfMonth(today));
    }
  }

  return (
    <div
      className="-mx-4 flex min-h-0 flex-1 flex-col md:-mx-6"
      data-testid="appointments-month-calendar"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-y border-border bg-background">
        <AppointmentsCalendarNav
          focusDate={calendarView === "month" ? visibleMonth : agendaDay}
          view={calendarView}
          isLoading={isLoading}
          onNavigate={handleNavigate}
          onToday={handleToday}
        />

        {calendarView === "month" ? (
          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto xl:grid-cols-[minmax(0,1fr)_320px] xl:overflow-hidden">
            <div
              className="h-full min-h-0 min-w-0 overflow-auto overscroll-contain bg-background"
              data-testid="appointments-calendar-month-grid"
            >
              <div className="flex min-w-[700px] flex-col">
                <div className="sticky top-0 z-10 grid grid-cols-7 border-b border-border bg-muted/30">
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
                        onDaySelect={changeFocusDate}
                        onAppointmentSelect={onAppointmentSelect}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            <AppointmentsCalendarAgenda
              day={agendaDay}
              appointments={
                appointmentsByDay.get(format(agendaDay, "yyyy-MM-dd")) ?? []
              }
              disabled={isLoading}
              onSchedule={() => onDaySelect(agendaDay)}
              onAppointmentSelect={onAppointmentSelect}
            />
          </div>
        ) : calendarView === "week" ? (
          <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
            <AppointmentsCalendarWeekView
              days={weekDays}
              appointmentsByDay={appointmentsByDay}
              disabled={isLoading}
              onDayOpen={(day) => {
                changeFocusDate(day);
                router.replace(appointmentsCalendarHref("day"), { scroll: false });
              }}
              onSchedule={onDaySelect}
              onAppointmentSelect={onAppointmentSelect}
            />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
            <AppointmentsCalendarDaySchedule
              day={agendaDay}
              appointments={
                appointmentsByDay.get(format(agendaDay, "yyyy-MM-dd")) ?? []
              }
              disabled={isLoading}
              onSchedule={onDaySelect}
              onAppointmentSelect={onAppointmentSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}
