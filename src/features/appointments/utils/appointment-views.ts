import { ROUTES } from "@/constants/routes";

export const APPOINTMENTS_VIEW_MODES = ["list", "board", "calendar"] as const;
export type AppointmentsViewMode = (typeof APPOINTMENTS_VIEW_MODES)[number];

export const APPOINTMENTS_CALENDAR_VIEWS = ["month", "week", "day"] as const;
export type AppointmentsCalendarView =
  (typeof APPOINTMENTS_CALENDAR_VIEWS)[number];

export const APPOINTMENTS_CALENDAR_VIEW_PARAM = "view";

export function parseAppointmentsViewFromPath(
  pathname: string,
): AppointmentsViewMode {
  if (
    pathname === ROUTES.appointmentsBoard ||
    pathname.startsWith(`${ROUTES.appointmentsBoard}/`)
  ) {
    return "board";
  }

  if (
    pathname === ROUTES.appointmentsCalendar ||
    pathname.startsWith(`${ROUTES.appointmentsCalendar}/`)
  ) {
    return "calendar";
  }

  return "list";
}

export function appointmentsViewHref(mode: AppointmentsViewMode): string {
  if (mode === "board") {
    return ROUTES.appointmentsBoard;
  }

  if (mode === "calendar") {
    return ROUTES.appointmentsCalendar;
  }

  return ROUTES.appointments;
}

export function parseAppointmentsCalendarView(
  value: string | null | undefined,
): AppointmentsCalendarView {
  if (value === "week" || value === "day" || value === "month") {
    return value;
  }

  return "month";
}

export function appointmentsCalendarHref(
  view: AppointmentsCalendarView,
): string {
  if (view === "month") {
    return ROUTES.appointmentsCalendar;
  }

  return `${ROUTES.appointmentsCalendar}?${APPOINTMENTS_CALENDAR_VIEW_PARAM}=${view}`;
}
