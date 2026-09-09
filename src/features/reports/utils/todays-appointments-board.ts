import type {
  Appointment,
  AppointmentStatus,
} from "@/features/appointments/types/appointment.types";

export type BoardGroupBy = "time" | "provider" | "clinic";

export type BoardStatusFilter =
  | "all"
  | "live"
  | "upcoming"
  | "done"
  | "missed"
  | "due";

export type BoardMetrics = {
  total: number;
  live: number;
  upcoming: number;
  done: number;
  missed: number;
  dueCount: number;
  dueAmount: number;
};

export type BoardGroup = {
  key: string;
  label: string;
  appointments: Appointment[];
};

export type BoardRenderItem =
  | { type: "heading"; key: string; label: string; count: number }
  | { type: "now" }
  | { type: "row"; appointment: Appointment };

export const BOARD_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  in_progress: "In session",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
  rescheduled: "Rescheduled",
};

const CLOCK_FORMAT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function localTodayIso(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatBoardClock(value: Date): string {
  return CLOCK_FORMAT.format(value);
}

export function formatAppointmentTimeRange(
  startIso: string,
  endIso: string,
): string {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) {
    return "";
  }

  const end = new Date(endIso);
  if (Number.isNaN(end.getTime())) {
    return formatBoardClock(start);
  }

  return `${formatBoardClock(start)}-${formatBoardClock(end)}`;
}

export function formatHourHeading(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:00`;
}

export function parseOutstandingBalance(value: string | undefined): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

export function hasOutstandingBalance(appointment: Appointment): boolean {
  return parseOutstandingBalance(appointment.outstanding_balance) > 0;
}

export function isUpcomingStatus(status: AppointmentStatus): boolean {
  return (
    status === "scheduled" ||
    status === "confirmed" ||
    status === "rescheduled"
  );
}

export function isMissedStatus(status: AppointmentStatus): boolean {
  return status === "cancelled" || status === "no_show";
}

export function matchesBoardStatusFilter(
  appointment: Appointment,
  filter: BoardStatusFilter,
): boolean {
  if (filter === "all") {
    return true;
  }
  if (filter === "due") {
    return hasOutstandingBalance(appointment);
  }
  if (filter === "live") {
    return appointment.status === "in_progress";
  }
  if (filter === "upcoming") {
    return isUpcomingStatus(appointment.status);
  }
  if (filter === "done") {
    return appointment.status === "completed";
  }
  return isMissedStatus(appointment.status);
}

export function matchesBoardSearch(
  appointment: Appointment,
  query: string,
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const haystack = [
    appointment.patient_name,
    appointment.clinician_name,
    appointment.department_name,
    appointment.clinic_name,
    appointment.reason,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

export function filterBoardAppointments(
  appointments: Appointment[],
  filter: BoardStatusFilter,
  query: string,
): Appointment[] {
  return appointments.filter(
    (appointment) =>
      matchesBoardStatusFilter(appointment, filter) &&
      matchesBoardSearch(appointment, query),
  );
}

export function buildBoardMetrics(appointments: Appointment[]): BoardMetrics {
  return appointments.reduce<BoardMetrics>(
    (metrics, appointment) => {
      metrics.total += 1;
      if (appointment.status === "in_progress") {
        metrics.live += 1;
      } else if (isUpcomingStatus(appointment.status)) {
        metrics.upcoming += 1;
      } else if (appointment.status === "completed") {
        metrics.done += 1;
      } else if (isMissedStatus(appointment.status)) {
        metrics.missed += 1;
      }

      const due = parseOutstandingBalance(appointment.outstanding_balance);
      if (due > 0) {
        metrics.dueCount += 1;
        metrics.dueAmount += due;
      }

      return metrics;
    },
    {
      total: 0,
      live: 0,
      upcoming: 0,
      done: 0,
      missed: 0,
      dueCount: 0,
      dueAmount: 0,
    },
  );
}

function compareAppointments(left: Appointment, right: Appointment): number {
  return (
    new Date(left.scheduled_start).getTime() -
    new Date(right.scheduled_start).getTime()
  );
}

function sortGroupedAppointments(appointments: Appointment[]): Appointment[] {
  return [...appointments].toSorted(compareAppointments);
}

export function groupBoardAppointments(
  appointments: Appointment[],
  groupBy: BoardGroupBy,
): BoardGroup[] {
  if (groupBy === "time") {
    return [];
  }

  const grouped = new Map<string, BoardGroup>();

  for (const appointment of appointments) {
    const key =
      groupBy === "provider"
        ? appointment.clinician_name?.trim() || "unassigned"
        : appointment.clinic_name?.trim() || "no-clinic";
    const label =
      groupBy === "provider"
        ? appointment.clinician_name?.trim() || "Unassigned"
        : appointment.clinic_name?.trim() || "No clinic";

    const existing = grouped.get(key);
    if (existing) {
      existing.appointments.push(appointment);
      continue;
    }

    grouped.set(key, { key, label, appointments: [appointment] });
  }

  return [...grouped.values()]
    .map((group) => ({
      ...group,
      appointments: sortGroupedAppointments(group.appointments),
    }))
    .toSorted((left, right) => {
      const leftFallback = left.key === "unassigned" || left.key === "no-clinic";
      const rightFallback = right.key === "unassigned" || right.key === "no-clinic";
      if (leftFallback !== rightFallback) {
        return leftFallback ? 1 : -1;
      }
      return left.label.localeCompare(right.label);
    });
}

export function buildTimeBoardItems(
  appointments: Appointment[],
  now: Date,
): BoardRenderItem[] {
  const sorted = sortGroupedAppointments(appointments);
  const hourCounts = new Map<string, number>();

  for (const appointment of sorted) {
    const start = new Date(appointment.scheduled_start);
    if (Number.isNaN(start.getTime())) {
      continue;
    }
    const hourKey = formatHourHeading(start);
    hourCounts.set(hourKey, (hourCounts.get(hourKey) ?? 0) + 1);
  }

  const items: BoardRenderItem[] = [];
  let currentHour = "";
  let nowInserted = false;
  const nowMs = now.getTime();

  const insertNow = () => {
    if (nowInserted) {
      return;
    }
    items.push({ type: "now" });
    nowInserted = true;
  };

  for (const appointment of sorted) {
    const start = new Date(appointment.scheduled_start);
    if (!nowInserted && !Number.isNaN(start.getTime()) && start.getTime() >= nowMs) {
      insertNow();
    }

    const hourKey = Number.isNaN(start.getTime())
      ? "Unknown"
      : formatHourHeading(start);

    if (hourKey !== currentHour) {
      currentHour = hourKey;
      items.push({
        type: "heading",
        key: hourKey,
        label: hourKey,
        count: hourCounts.get(hourKey) ?? 0,
      });
    }

    items.push({ type: "row", appointment });
  }

  if (!nowInserted && sorted.length > 0) {
    insertNow();
  }

  return items;
}

export function boardStatusAccentClass(status: AppointmentStatus): string {
  switch (status) {
    case "in_progress":
      return "bg-amber-500";
    case "confirmed":
      return "bg-brand-primary";
    case "completed":
      return "bg-emerald-500";
    case "cancelled":
    case "no_show":
      return "bg-red-500";
    case "rescheduled":
      return "bg-slate-400";
    default:
      return "bg-slate-300";
  }
}
